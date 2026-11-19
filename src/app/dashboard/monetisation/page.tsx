"use client";


import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import JSZip from "jszip";
import { useWallet } from "@/hooks/useWallet";
import UpgradePlanModal from "@/components/UpgradePlanModal";
import { TOOL_CREDIT_COSTS } from "@/lib/billing/plans";
import {
  generateTrendCartelProductHTML,
  generateThreeCoverVariationsHTML,
} from "@/lib/renderers/trendCartelProductRenderer";
import {
  Sparkles,
  Coins,
  ChevronDown,
  ChevronUp,
  Trophy,
  Star,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  BookOpen,
  Dumbbell,
  Package,
  FileText,
  Pencil,
  Eye,
  X,
  Download,
  ExternalLink,
  Target,
  Mail,
  Rocket,
  Image as ImageIcon,
  TrendingUp,
  Search,
  CheckCircle2,
  ThumbsUp,
  ListChecks,
  Plus,
  Clock,
  FolderCheck,
} from "lucide-react";

const MAIN_FORMATS = [
  {
    id: "ebook",
    title: "Full Ebook",
    length: "20–50 pages",
    priceRange: "Typical $27–$97 / ₦8k–₦25k",
    credits: TOOL_CREDIT_COSTS.monetisation_ebook, // 30 credits (Paid plans only)
    desc: "Deep authority builder. Comprehensive topic coverage.",
    icon: BookOpen,
  },
  {
    id: "challenge",
    title: "Challenge Kit",
    length: "7 or 30 days",
    priceRange: "Typical $12–$27 / ₦5k–₦12k",
    credits: TOOL_CREDIT_COSTS.monetisation_challenge, // 20 credits
    desc: "Daily challenges driving engagement and results.",
    icon: Dumbbell,
  },
  {
    id: "template",
    title: "Template Pack",
    length: "4–6 page PDF or Notion system",
    priceRange: "Typical $7–$29 / ₦3.5k–₦15k",
    credits: TOOL_CREDIT_COSTS.monetisation_template, // 12 credits
    desc: "A concise planner, tracker or Notion system your buyer uses straight away.",
    icon: Package,
    recommended: true,
  },
];

const TEMPLATE_SUBTYPES = [
  {
    id: "Digital Planner",
    title: "Digital Planner",
    desc: "Undated yearly, monthly, weekly and daily pages, with a tappable contents page.",
    price: "Typical $7–$29 · ₦4,500–₦10,000",
    note: "Ready to sell as a PDF. No setup for your buyer.",
  },
  {
    id: "Habit & Fitness Tracker",
    title: "Habit & Fitness Tracker",
    desc: "Monthly habit grids, a streak chain, workout logs and a weekly review.",
    price: "Typical $5–$19 · ₦3,500–₦8,000",
    note: "Ready to sell as a PDF. No setup for your buyer.",
  },
  {
    id: "Budget & Money Tracker",
    title: "Budget & Money Tracker",
    desc: "Monthly spreads, bill trackers, debt payoff sheets and a savings challenge.",
    price: "Typical $3–$15 · ₦3,500–₦7,500",
    note: "Ready to sell as a PDF. No setup for your buyer.",
  },
  {
    id: "Meal Planner",
    title: "Meal Planner",
    desc: "Weekly meal grids, a grocery list grouped by aisle, and recipe cards.",
    price: "Typical $4–$14 · ₦3,500–₦6,500",
    note: "Bundle several sets together for higher Naira & USD margins.",
  },
  {
    id: "Event Planner",
    title: "Event Planner",
    desc: "Undated countdown checklists, budget and guest trackers, supplier sheets and a run of show.",
    price: "Typical $7–$19 · ₦5,000–₦12,000",
    note: "Ready to sell as a PDF. No setup for your buyer.",
  },
  {
    id: "Interview Prep Workbook",
    title: "Interview Prep Workbook",
    desc: "STAR story sheets, a competency grid, company research and interview debriefs.",
    price: "Typical $5–$19 · ₦4,500–₦9,500",
    note: "Ready to sell as a PDF. No setup for your buyer.",
  },
  {
    id: "Notion System",
    title: "Notion System",
    desc: "Importable Notion databases with relations and rollups, plus a build guide.",
    price: "Typical $17–$47 · ₦7,500–₦18,000",
    note: "Highest price tier; delivers via 1-click duplicate link.",
  },
];

const PACKAGING_STEPS = [
  "Validating inputs",
  "Planning the pages",
  "Laying out your pages",
  "Resolving images",
  "Building companion files",
  "Packaging deliverables",
];

const LAUNCH_DAY_CHECKLIST = [
  {
    id: 1,
    title: "1. Upload your product file",
    desc: "Upload the ZIP or manuscript you just downloaded to Selar, Gumroad, or Etsy. Open it once yourself to confirm it's the final version.",
  },
  {
    id: 2,
    title: "2. Set your price",
    desc: "Type the price you chose in the Pricing step. Keep it in the ₦4,500–₦12,000 (Selar) or $17–$47 (Global) first-product zone.",
  },
  {
    id: 3,
    title: "3. Switch on automatic delivery",
    desc: "The file or download link must be emailed and delivered the instant payment clears — no manual sending.",
  },
  {
    id: 4,
    title: "4. Add a one-line refund policy",
    desc: "e.g. 'Not happy? Message me within 14 days for a full refund.' It removes buyer hesitation and builds immediate trust.",
  },
  {
    id: 5,
    title: "5. Run a test purchase",
    desc: "Buy it yourself (or use the platform's test mode) and confirm the file lands in your inbox. The moment it does, you're open for business.",
  },
];

function MonetisationWizardContent() {
  const searchParams = useSearchParams();
  const incomingTopic = searchParams.get("topic") || "";

  // Wallet & Enforcement State
  const { wallet, checkCanRunTool, recordToolUsage } = useWallet();
  const credits = wallet.credits;
  const [upgradeReason, setUpgradeReason] = useState<
    "FREE_TIER_TOOL_LOCKED" | "INSUFFICIENT_CREDITS" | "MANUAL_UPGRADE" | null
  >(null);

  const savedProducts = wallet.savedTasks.filter((t) => t.toolKey === "monetisation");

  // Wizard Stages (1 to 11)
  const [stage, setStage] = useState<number>(1);
  const [loadingText, setLoadingText] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<number>(15);
  const [formError, setFormError] = useState<string | null>(null);

  // Stage 1: Define Inputs
  const [displayName, setDisplayName] = useState("");
  const [niche, setNiche] = useState(incomingTopic || "");
  const [targetAudience, setTargetAudience] = useState(
    "Busy 25–40 year old professionals wanting practical solutions"
  );
  const [platform, setPlatform] = useState("WhatsApp & Instagram");
  const [skillLevel, setSkillLevel] = useState("Beginner");
  const [targetCountry, setTargetCountry] = useState("Nigeria (Validate in ₦, Scale to $)");
  const [goal, setGoal] = useState("Make my first ₦50,000 – $200 in sales");
  const [hasAudience, setHasAudience] = useState<"yes" | "no">("no");
  const [ideaExpertise, setIdeaExpertise] = useState(
    incomingTopic ? `Practical Step-by-Step System & Toolkit for ${incomingTopic}` : ""
  );
  const [painPoints, setPainPoints] = useState(
    "Lack of time to figure things out from scratch\nOverwhelmed by conflicting advice online\nWasting money on trial and error"
  );

  // Stage 2: Ideas
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [openWhyIndex, setOpenWhyIndex] = useState<number | null>(0);

  // Stage 3 & 4: Format & Sub-type Selection
  const [selectedFormatId, setSelectedFormatId] = useState<string>("template");
  const [selectedSubType, setSelectedSubType] = useState<string>("Digital Planner");

  // Stage 5 & 6: Structure & Customization
  const [structurePages, setStructurePages] = useState<any[]>([]);
  const [regeneratingPageIdx, setRegeneratingPageIdx] = useState<number | null>(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const [brandColor, setBrandColor] = useState("Emerald & Slate");
  const [writingVoice, setWritingVoice] = useState("Direct, practical & encouraging");

  // Stage 7: Generated Content Accordions
  const [generatedContentData, setGeneratedContentData] = useState<{
    summaryText: string;
    totalWords: number;
    pagesContent: any[];
  } | null>(null);
  const [expandedContentPages, setExpandedContentPages] = useState<number[]>([1]);
  const [copiedAll, setCopiedAll] = useState(false);

  // Stage 8 & 9: Package Setup & Individual Files
  const [editableProductTitle, setEditableProductTitle] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [showAuthorInside, setShowAuthorInside] = useState(true);
  const [isPackaging, setIsPackaging] = useState(false);
  const [packagingStepIdx, setPackagingStepIdx] = useState(0);
  const [packagingElapsed, setPackagingElapsed] = useState(0);
  const [selectedStoreTab, setSelectedStoreTab] = useState<"Selar" | "Gumroad" | "Etsy">("Selar");

  // Stage 10 & 11: Pricing Strategy & Launch Checklist
  const [pricingData, setPricingData] = useState<any | null>(null);
  const [isGeneratingPricing, setIsGeneratingPricing] = useState(false);
  const [completedChecklistIds, setCompletedChecklistIds] = useState<number[]>([]);

  // Rating Modal
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState("");
  const [ratingPublicConsent, setRatingPublicConsent] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  useEffect(() => {
    if (incomingTopic) {
      setNiche(incomingTopic);
      setIdeaExpertise(`The Complete ${incomingTopic} Action System & Checklist`);
    }
  }, [incomingTopic]);

  const currentFormatObj = MAIN_FORMATS.find((f) => f.id === selectedFormatId) || MAIN_FORMATS[2];
  const activeFormatLabel =
    selectedFormatId === "template" ? selectedSubType : currentFormatObj.title;
  const finalTitle = editableProductTitle || selectedIdea?.title || "Digital Toolkit";
  const authorLabel = showAuthorInside && displayName.trim() ? displayName.trim() : "The Team";

  const toggleChecklist = (id: number) => {
    setCompletedChecklistIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Helper: Trigger single file download
  const triggerDownload = (
    filename: string,
    content: string,
    mimeType = "text/plain;charset=utf-8"
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper: Generate customized TrendCartel package files
  const buildPackageFiles = () => {
    const slug = finalTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const designedProductHtml = generateTrendCartelProductHTML({
      productTitle: finalTitle,
      subtitle: `A Step-by-Step Practical Blueprint & Visual Toolkit for ${niche}`,
      authorName: authorLabel,
      showAuthor: showAuthorInside,
      mainFormatId: selectedFormatId,
      subFormat: activeFormatLabel,
      niche,
      brandPalette: brandColor,
      pages: generatedContentData?.pagesContent || [],
      includeWatermark: false,
    });

    const previewProductHtml = generateTrendCartelProductHTML({
      productTitle: finalTitle,
      subtitle: `A Step-by-Step Practical Blueprint & Visual Toolkit for ${niche}`,
      authorName: authorLabel,
      showAuthor: showAuthorInside,
      mainFormatId: selectedFormatId,
      subFormat: activeFormatLabel,
      niche,
      brandPalette: brandColor,
      pages: generatedContentData?.pagesContent || [],
      includeWatermark: true,
    });

    const coverHtml = generateThreeCoverVariationsHTML({
      productTitle: finalTitle,
      subFormat: activeFormatLabel,
      authorLabel,
      pageCount: structurePages.length + 4,
      brandPalette: brandColor,
    });

    const readmeTxt = `${finalTitle.toUpperCase()}\nFormat: ${activeFormatLabel}\nBrand Palette: ${brandColor}\nCreated by: ${authorLabel}\n\nHOW TO EXPORT AS PDF:\n1. Open ${slug}-designed-product.html in Chrome, Edge, or Safari.\n2. Press Ctrl+P (or Cmd+P on Mac) -> Select "Save as PDF".\n3. Set Paper Size to A4, Margins to None, and enable "Background graphics".\n4. Upload the PDF and your chosen cover from ${slug}-3-covers.html to Selar, Gumroad, or Etsy.`;

    const startSellingMd = `# 3 Steps to Turn "${finalTitle}" Into a Live Sellable Product\n\n## Step 1: Export Print-Ready PDF\nOpen \`${slug}-designed-product.html\` in your browser and press **Ctrl+P / Cmd+P → Save as PDF** (Paper: A4, Margins: None, Background Graphics: Checked).\n\n## Step 2: Validate Locally in Naira (Selar)\n1. Create a free account at https://selar.com and click **Add Product → Digital Product**.\n2. Upload your PDF and cover image.\n3. Set price between **₦4,500 – ₦8,500** and share your link on WhatsApp Status & X.\n\n## Step 3: Scale Globally in USD (Gumroad / Etsy)\n1. Open a shop at https://gumroad.com or https://www.etsy.com/sell\n2. Upload the same PDF and paste the listing copy from \`LISTING-COPY.md\` at **$19 – $37**.`;

    const listingCopyMd = `# Storefront Listing Copy: ${finalTitle}\n\n## Product Title\n${finalTitle} | Instant Digital Download (${activeFormatLabel})\n\n## Short Hook (For WhatsApp / Social Bio)\nStop wasting time guessing. Get the plug-and-play ${finalTitle} designed to help you execute faster with zero overwhelm.\n\n## Full Store Description\nAre you tired of scattered advice and complicated setups? **${finalTitle}** gives you a clean, step-by-step system you can use immediately.\n\n### What's Inside (${structurePages.length + 4} Master Pages):\n${structurePages
      .map((p) => `- **${p.title}** — ${p.description}`)
      .join("\n")}\n- **Bonus Visual Execution Sheet** tailored for ${activeFormatLabel}\n\n## SEO Tags (Etsy / Gumroad)\n${activeFormatLabel.toLowerCase()}, ${niche.toLowerCase()}, printable tracker, productivity template, instant download, digital planner, step by step guide`;

    return {
      slug,
      designedProductHtml,
      previewProductHtml,
      readmeTxt,
      startSellingMd,
      listingCopyMd,
      coverHtml,
    };
  };

  const handleOpenDesignedDocument = (isPreview = false, autoPrint = false) => {
    const { designedProductHtml, previewProductHtml } = buildPackageFiles();
    const htmlToOpen = isPreview ? previewProductHtml : designedProductHtml;
    const blob = new Blob([htmlToOpen], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win && autoPrint) {
      win.onload = () => {
        setTimeout(() => win.print(), 600);
      };
    }
  };

  const handleDownloadCompleteZip = async () => {
    const {
      slug,
      designedProductHtml,
      readmeTxt,
      startSellingMd,
      listingCopyMd,
      coverHtml,
    } = buildPackageFiles();
    const zip = new JSZip();

    zip.file(`${slug}-designed-product.html`, designedProductHtml);
    zip.file(`${slug}-3-covers.html`, coverHtml);
    zip.file("README.txt", readmeTxt);
    zip.file("START-SELLING.md", startSellingMd);
    zip.file("LISTING-COPY.md", listingCopyMd);

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-complete-package.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Step 1 -> Step 2: Generate Product Ideas (3 credits)
  const handleGenerateIdeas = async () => {
    setFormError(null);
    if (!displayName.trim()) {
      setFormError(
        "Display Name is required. Strictly enter the author or brand name you want buyers to see."
      );
      return;
    }
    if (!niche.trim()) {
      setFormError("Please enter your Niche or Topic before generating ideas.");
      return;
    }

const ideaCost = 0; // Idea brainstorming is free; credits are only deducted when building a product format

    setLoadingText("Consulting 30+ Verified Market Sources...");
    setLoadingProgress(35);
    try {
      const res = await fetch("/api/monetisation/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          niche,
          targetAudience,
          platform,
          skillLevel,
          country: targetCountry,
          goal,
          hasAudience,
          ideaExpertise,
          painPoints,
          userId: wallet.userId,
        }),
      });
      const json = await res.json();
if (!res.ok) {
        if (json.code === "INSUFFICIENT_CREDITS") {
          setUpgradeReason(json.code);
          return;
        }
        throw new Error(json.error || "Failed to generate product ideas.");
      }

      setAnalysisData(json.data.aiAnalysis);
      setIdeas(json.data.ideas || []);
      if (json.data.ideas?.length > 0) {
        setSelectedIdea(json.data.ideas[0]);
        setEditableProductTitle(json.data.ideas[0].title);
      }
      setStage(2);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setLoadingText(null);
    }
  };

  // Step 4 -> Step 5: Deduct Credits (12 / 20 / 30) & Build Product Structure
 const handleCommitAndBuildStructure = async () => {
    const cost = currentFormatObj.credits;
    if (wallet.credits < cost) {
      setUpgradeReason("INSUFFICIENT_CREDITS");
      return;
    }
    setFormError(null);
    setLoadingText(`Deducting ${cost} credits & planning your ${activeFormatLabel} pages...`);
    setLoadingProgress(50);

    try {
      const res = await fetch("/api/monetisation/structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          productTitle: finalTitle,
          niche,
          format: currentFormatObj.title,
          subFormat: activeFormatLabel,
          userId: wallet.userId,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.code === "FREE_TIER_TOOL_LOCKED" || json.code === "INSUFFICIENT_CREDITS") {
          setUpgradeReason(json.code);
          return;
        }
        throw new Error(json.error || "Failed to generate structure.");
      }

      recordToolUsage({
        toolKey: "monetisation",
        creditCost: cost,
        taskTitle: finalTitle,
        taskPayload: json.pages || [],
      });
      setStructurePages(json.pages || []);
      setStage(5);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setLoadingText(null);
    }
  };

  // Regenerate a single page card (Free once committed)
  const handleRegenerateSinglePage = async (idx: number) => {
    setRegeneratingPageIdx(idx);
    try {
      const res = await fetch("/api/monetisation/structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          productTitle: finalTitle,
          niche,
          format: currentFormatObj.title,
          subFormat: activeFormatLabel,
          singlePageIndex: idx,
          existingPages: structurePages,
          userId: wallet.userId,
        }),
      });
      const json = await res.json();
      if (res.ok && json.page) {
        const updated = [...structurePages];
        updated[idx] = { ...updated[idx], ...json.page };
        setStructurePages(updated);
      }
    } finally {
      setRegeneratingPageIdx(null);
    }
  };

  // Step 6 -> Step 7: Generate Complete Content
  const handleGenerateCompleteContent = async () => {
    setLoadingText(`Building your ${activeFormatLabel}...`);
    setLoadingProgress(25);
    setFormError(null);

    const progressTimer = setInterval(() => {
      setLoadingProgress((prev) => (prev < 88 ? prev + 12 : prev));
    }, 1200);

    try {
      const res = await fetch("/api/monetisation/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          productTitle: finalTitle,
          niche,
          subFormat: activeFormatLabel,
          pages: structurePages,
          writingVoice,
          userId: wallet.userId,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to generate content.");

      setLoadingProgress(100);
      const contentBundle = {
        summaryText: json.summaryText,
        totalWords: json.totalWords,
        pagesContent: json.pagesContent || [],
      };
      setGeneratedContentData(contentBundle);
      setExpandedContentPages([1]);
      setStage(7);

      // Save full generated content to wallet history (7-day expiry on Free tier)
      recordToolUsage({
        toolKey: "monetisation",
        creditCost: 0,
        taskTitle: finalTitle,
        taskPayload: {
          niche,
          format: activeFormatLabel,
          structurePages,
          contentBundle,
        },
      });

      try {
        const existing = JSON.parse(localStorage.getItem("trendcartel_products") || "[]");
        const newEntry = {
          id: Date.now().toString(),
          title: finalTitle,
          niche,
          format: activeFormatLabel,
          author: authorLabel,
          createdAt: new Date().toISOString(),
        };
        const filtered = existing.filter((p: any) => p.title !== finalTitle);
        localStorage.setItem("trendcartel_products", JSON.stringify([newEntry, ...filtered]));
      } catch (e) {
        console.warn("Could not persist product history locally:", e);
      }
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      clearInterval(progressTimer);
      setLoadingText(null);
    }
  };

  // Step 8 -> Step 9: Animated Packaging Sequence
  const handleStartPackaging = () => {
    setIsPackaging(true);
    setPackagingStepIdx(0);
    setPackagingElapsed(0);

    const secTimer = setInterval(() => {
      setPackagingElapsed((prev) => prev + 1);
    }, 1000);

    let currentStep = 0;
    const stepTimer = setInterval(() => {
      currentStep += 1;
      if (currentStep < PACKAGING_STEPS.length) {
        setPackagingStepIdx(currentStep);
      } else {
        clearInterval(stepTimer);
        clearInterval(secTimer);
        setIsPackaging(false);
        setStage(9);

        try {
          const existing = JSON.parse(localStorage.getItem("trendcartel_products") || "[]");
          const newEntry = {
            id: Date.now().toString(),
            title: finalTitle,
            niche,
            format: activeFormatLabel,
            author: authorLabel,
            createdAt: new Date().toISOString(),
          };
          const filtered = existing.filter((p: any) => p.title !== finalTitle);
          localStorage.setItem("trendcartel_products", JSON.stringify([newEntry, ...filtered]));
        } catch (e) {
          console.warn("Could not persist product history locally:", e);
        }

        if (!ratingSubmitted) {
          setShowRatingModal(true);
        }
      }
    }, 850);
  };

  // Stage 10: Fetch Live Pricing Strategy & Buyer Quotes
  const handleFetchPricingAndBuyerData = async (deductCredits = false) => {
    const pricingCost = TOOL_CREDIT_COSTS.monetisation_pricing; // 5 credits
    if (deductCredits) {
      const guard = checkCanRunTool("monetisation", pricingCost);
      if (!guard.allowed) {
        setUpgradeReason(guard.reason);
        return;
      }
    }

    setIsGeneratingPricing(true);
    setFormError(null);

    try {
      const res = await fetch("/api/monetisation/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productTitle: finalTitle,
          niche,
          format: activeFormatLabel,
          userId: deductCredits ? wallet.userId : "guest-trial-user",
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.code === "FREE_TIER_TOOL_LOCKED" || json.code === "INSUFFICIENT_CREDITS") {
          setUpgradeReason(json.code);
          return;
        }
        throw new Error(json.error || "Failed to generate pricing.");
      }

      if (deductCredits) {
        recordToolUsage({
          toolKey: "monetisation",
          creditCost: pricingCost,
        });
      }

      if (json.data) {
        setPricingData(json.data);
      }
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsGeneratingPricing(false);
    }
  };

  const handleSendReview = () => {
    if (ratingStars > 0 && !ratingSubmitted) {
      setRatingSubmitted(true);
    }
    setShowRatingModal(false);
  };

  const toggleAccordionPage = (pageNum: number) => {
    setExpandedContentPages((prev) =>
      prev.includes(pageNum) ? prev.filter((p) => p !== pageNum) : [...prev, pageNum]
    );
  };

  const handleCopyAllContent = () => {
    if (!generatedContentData) return;
    const fullText = generatedContentData.pagesContent
      .map((p) => `PAGE ${p.pageNumber} — ${p.title}\n\n${p.bodyText}`)
      .join("\n\n----------------------------------------\n\n");
    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const progressBarStep =
    stage === 1
      ? 1
      : stage === 2
      ? 2
      : stage >= 3 && stage <= 7
      ? 3
      : stage === 8 || stage === 9
      ? 4
      : stage === 10
      ? 5
      : 6;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Monetisation AI</h1>
            <p className="text-[11px] text-slate-500">30+ Expert Source Synthesis Engine</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setUpgradeReason("MANUAL_UPGRADE")}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 font-semibold text-xs"
        >
          <Coins className="w-4 h-4 text-amber-600 fill-amber-500" />
          <span>
            <strong>{credits}</strong> Credits Available
          </span>
        </button>
      </div>

      {/* Saved Product Banner (7-day retention notice on Free tier) */}
      {stage === 1 && savedProducts.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs">
            <FolderCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-slate-900">
                Saved Product: {savedProducts[0].title}
              </span>
              {savedProducts[0].expiresAt && (
                <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-amber-700 font-semibold">
                  <Clock className="w-3 h-3" /> Expires in 7 days (Free Tier)
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const saved = savedProducts[0].payload as any;
              setEditableProductTitle(savedProducts[0].title);
              if (saved?.niche) setNiche(saved.niche);
              if (saved?.contentBundle) {
                setGeneratedContentData(saved.contentBundle);
                setStructurePages(saved.structurePages || []);
                setSelectedIdea({ title: savedProducts[0].title, format: saved.format });
                setStage(7);
              }
            }}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold self-start sm:self-auto"
          >
            Resume Saved Product
          </button>
        </div>
      )}

      {/* Product Title Banner on Stages 5–11 */}
      {stage >= 5 && selectedIdea && (
        <div className="text-center space-y-1.5 pt-1">
          {stage === 11 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-1">
              🎉 Product complete
            </span>
          )}
          <h2 className="text-2xl font-extrabold text-slate-900">{finalTitle}</h2>
          <div className="flex items-center justify-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
              <Package className="w-3.5 h-3.5" /> {activeFormatLabel}
            </span>
            {generatedContentData && stage >= 7 && stage < 11 && (
              <span className="text-slate-400 font-medium">
                {generatedContentData.totalWords.toLocaleString()} words
              </span>
            )}
          </div>
        </div>
      )}

      {/* 6-Step Progress Bar */}
      <div className="flex items-center justify-center gap-4 sm:gap-8 text-xs py-2">
        {[
          { num: 1, label: "Define" },
          { num: 2, label: "Ideas" },
          { num: 3, label: "Content" },
          { num: 4, label: "Package" },
          { num: 5, label: "Pricing" },
          { num: 6, label: "Done" },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-1.5">
            <span
              className={`h-6 w-6 rounded-full flex items-center justify-center font-mono text-[11px] font-bold ${
                progressBarStep === s.num || stage === 11
                  ? "bg-emerald-500 text-white"
                  : progressBarStep > s.num
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-200/70 text-slate-400"
              }`}
            >
              {progressBarStep > s.num || stage === 11 ? "✓" : s.num}
            </span>
            <span
              className={`font-semibold hidden sm:inline ${
                progressBarStep === s.num || stage === 11 ? "text-slate-900" : "text-slate-400"
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {formError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-medium">
          {formError}
        </div>
      )}

      {/* LOADING SCREEN */}
      {loadingText && (
        <div className="bg-white border border-slate-200 rounded-3xl p-14 text-center shadow-sm space-y-5 my-6">
          <Loader2 className="w-12 h-12 text-[#6D28D9] animate-spin mx-auto" />
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{loadingText}</h2>
            <p className="text-xs text-slate-500 mt-1">Keep this tab open.</p>
          </div>

          <div className="max-w-md mx-auto space-y-1.5">
            <div className="w-full h-2.5 bg-amber-400/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#6D28D9] transition-all duration-500 rounded-full"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>Synthesizing verified sources...</span>
              <span>{loadingProgress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 1: DEFINE YOUR IDEA */}
      {!loadingText && stage === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-slate-900">Define Your Idea</h2>
            <p className="text-xs text-slate-500 mt-1">Tell us about your niche and audience</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Display Name <span className="text-rose-600">*</span>
              </label>
              <p className="text-[11px] text-slate-400 mb-1.5">
                Shown on covers and About the Author. Strictly enter the name or brand you want buyers to see.
              </p>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your desired author or brand name (e.g. Tobi Adeyemi)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-250 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Your Niche *</label>
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g. Making Money, Food Prep, Remote Work"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-250 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-250 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-250 bg-white text-xs text-slate-900"
                >
                  <option value="WhatsApp & Instagram">WhatsApp & Instagram</option>
                  <option value="Twitter / X & LinkedIn">Twitter / X & LinkedIn</option>
                  <option value="TikTok & YouTube Shorts">TikTok & YouTube Shorts</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Audience Skill Level
                </label>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-250 bg-white text-xs text-slate-900"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Which country is this product for? (Optional)
              </label>
              <select
                value={targetCountry}
                onChange={(e) => setTargetCountry(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-250 bg-white text-xs text-slate-900"
              >
                <option value="Nigeria (Validate in ₦, Scale to $)">
                  Nigeria (Validate in ₦, Scale to $)
                </option>
                <option value="Not country-specific">Not country-specific (Global Tier-1)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Your Goal</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-250 bg-white text-xs text-slate-900"
              >
                <option value="Make my first ₦50,000 – $200 in sales">
                  Make my first ₦50,000 – $200 in sales
                </option>
                <option value="Build a high-converting lead magnet">
                  Build a high-converting lead magnet
                </option>
                <option value="Create a $29+ Tier-1 Notion or PDF asset">
                  Create a $29+ Tier-1 Notion or PDF asset
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Do you already have an audience?
              </label>
              <div className="flex gap-3 mt-1.5">
                <button
                  type="button"
                  onClick={() => setHasAudience("yes")}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                    hasAudience === "yes"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  Yes, I have an audience
                </button>
                <button
                  type="button"
                  onClick={() => setHasAudience("no")}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                    hasAudience === "no"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  No, not yet
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Your Idea or Expertise (Optional)
              </label>
              <textarea
                rows={2}
                value={ideaExpertise}
                onChange={(e) => setIdeaExpertise(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-250 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Audience Pain Points (Optional)
              </label>
              <textarea
                rows={3}
                value={painPoints}
                onChange={(e) => setPainPoints(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-250 text-xs text-slate-900"
              />
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleGenerateIdeas}
                className="px-8 py-3.5 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-sm transition shadow-md inline-flex items-center gap-2"
              >
                Generate Product Ideas (⚡ 3 credits) <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 2: PRODUCT IDEAS SELECTION */}
      {!loadingText && stage === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-slate-900">Product Ideas</h2>
            <p className="text-xs text-slate-500 mt-1">
              Select a product to build for <strong>{displayName}</strong>
            </p>
          </div>

          {analysisData && (
            <div className="bg-white border border-emerald-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900">AI Analysis</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Niche</span>
                  <strong className="text-slate-900 text-sm">{analysisData.niche}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Target Audience</span>
                  <strong className="text-slate-900 text-sm">{analysisData.targetAudience}</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700">Strengths</span>
                  {analysisData.strengths?.map((s: string, i: number) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-xs text-emerald-950"
                    >
                      {s}
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700">Opportunities</span>
                  {analysisData.opportunities?.map((o: string, i: number) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-xs text-emerald-950"
                    >
                      {o}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {ideas.map((idea, idx) => {
              const isSelected = selectedIdea?.title === idea.title;
              const isWhyOpen = openWhyIndex === idx;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedIdea(idea);
                    setEditableProductTitle(idea.title);
                  }}
                  className={`rounded-3xl p-5 border transition cursor-pointer flex flex-col justify-between relative ${
                    isSelected
                      ? "bg-emerald-50/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                      : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                  }`}
                >
                  {idea.isBestFit && (
                    <div className="absolute -top-3 left-4 bg-[#6D28D9] text-white text-[10px] font-bold px-3 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Trophy className="w-3 h-3" /> Best fit for your audience
                    </div>
                  )}

                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-700">{idea.format}</span>
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{idea.score}</span>
                        <span className="text-slate-400 font-normal">/10</span>
                      </div>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-base leading-snug">
                      {idea.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{idea.description}</p>

                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenWhyIndex(isWhyOpen ? null : idx);
                      }}
                      className="rounded-xl bg-slate-100/80 border border-slate-200/80 p-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-700">
                        <span>Why this one?</span>
                        {isWhyOpen ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </div>

                      {isWhyOpen && idea.whyThisOne && (
                        <div className="mt-2 pt-2 border-t border-slate-200 space-y-1.5 text-[11px] text-slate-600">
                          <div>
                            <strong className="text-slate-800">Pain Point:</strong>{" "}
                            {idea.whyThisOne.primaryPainPoint}
                          </div>
                          <div>
                            <strong className="text-slate-800">Audience Behavior:</strong>{" "}
                            {idea.whyThisOne.targetAudienceBehavior}
                          </div>
                          <div>
                            <strong className="text-slate-800">Edge:</strong>{" "}
                            {idea.whyThisOne.monetizationEdge}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
                        {idea.difficulty}
                      </span>
                      <span className="text-slate-400">{idea.buildTime}</span>
                    </div>

                    <div className="text-right font-mono font-bold text-emerald-700">
                      <div>{idea.priceRangeNGN}</div>
                      <div className="text-[10px] text-slate-400">{idea.priceRangeUSD}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={handleGenerateIdeas}
              className="px-4 py-2.5 rounded-xl border border-slate-250 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate Ideas (⚡ 3 cr)
            </button>

            <button
              type="button"
              onClick={() => setStage(3)}
              disabled={!selectedIdea}
              className="px-7 py-3.5 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-sm transition shadow-md inline-flex items-center gap-2 disabled:opacity-50"
            >
              Build This Product <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: CHOOSE YOUR PRODUCT FORMAT */}
      {!loadingText && stage === 3 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-slate-900">Choose Your Product Format</h2>
            <p className="text-xs text-slate-500 mt-1">
              Select the format that best fits your product
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {MAIN_FORMATS.map((fmt) => {
              const Icon = fmt.icon;
              const isSelected = selectedFormatId === fmt.id;
              return (
                <div
                  key={fmt.id}
                  onClick={() => setSelectedFormatId(fmt.id)}
                  className={`rounded-3xl p-6 border cursor-pointer transition relative flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? "bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                      : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                  }`}
                >
                  {fmt.recommended && (
                    <div className="absolute -top-3 left-5 bg-[#6D28D9] text-white text-[10px] font-bold px-3 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 fill-white" /> Recommended
                    </div>
                  )}

                  <div className="space-y-3 pt-1">
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-emerald-500/20 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base">{fmt.title}</h3>
                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                          {fmt.length}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {fmt.priceRange}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold font-mono">
                        ⚡ {fmt.credits} credits
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">{fmt.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedFormatId === "template" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  What kind of template pack?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  The printable options are finished files — your buyer downloads, prints and writes on them. Notion systems command the highest prices.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TEMPLATE_SUBTYPES.map((sub) => {
                  const isSubSelected = selectedSubType === sub.id;
                  return (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedSubType(sub.id)}
                      className={`p-5 rounded-2xl border cursor-pointer transition space-y-2 ${
                        isSubSelected
                          ? "bg-purple-50/60 border-purple-500 ring-1 ring-purple-500"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-sm">{sub.title}</h4>
                        {isSubSelected && (
                          <span className="text-[10px] font-mono font-bold text-purple-700 uppercase">
                            SELECTED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{sub.desc}</p>
                      <div className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {sub.price}
                      </div>
                      <p className="text-[11px] text-slate-400">{sub.note}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStage(2)}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Ideas
            </button>

            <button
              type="button"
              onClick={() => setStage(4)}
              className="px-8 py-3.5 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-sm transition shadow-md inline-flex items-center gap-2"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 4: COMMITMENT WARNING GATE */}
      {!loadingText && stage === 4 && selectedIdea && (
        <div className="py-12">
          <div className="max-w-lg mx-auto bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-5">
            <h2 className="text-xl font-extrabold text-slate-900">
              Ready to build “{finalTitle}”?
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Building this <strong>{activeFormatLabel}</strong> will deduct{" "}
              <strong>⚡ {currentFormatObj.credits} credits</strong> from your wallet. You can keep
              editing, regenerating individual pages, and repackaging <em>this</em> product as much
              as you like once started.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              If this isn't the idea or the format you want, go back and change it now — no credits
              are deducted until you press the button below.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCommitAndBuildStructure}
                className="px-6 py-3 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-xs transition shadow-md inline-flex items-center gap-2"
              >
                Build this product (⚡ {currentFormatObj.credits} credits){" "}
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setStage(3)}
                className="px-5 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Pick something else
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 5 & 6: PRODUCT STRUCTURE & GENERATE CONTENT TRIGGER */}
      {!loadingText && (stage === 5 || stage === 6) && selectedIdea && (
        <div className="space-y-6">
          {stage === 5 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStage(6)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 inline-flex items-center gap-1.5"
              >
                Skip & use Auto <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Your Product Structure</h3>
              <p className="text-xs text-slate-400">
                Pages below — regenerate any single one with the icon on the right.
              </p>
            </div>

            <div className="space-y-3">
              {structurePages.map((pg, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/40 flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <span className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-800 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {pg.pageNumber}
                    </span>
                    <div>
                      <div className="text-[10px] font-mono font-bold text-emerald-700 uppercase">
                        PAGE {String(pg.pageNumber).padStart(2, "0")}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{pg.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        {pg.description}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRegenerateSinglePage(idx)}
                    disabled={regeneratingPageIdx === idx}
                    title="Regenerate this page"
                    className="p-2 rounded-xl hover:bg-slate-200/70 text-slate-500 transition shrink-0"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${
                        regeneratingPageIdx === idx ? "animate-spin text-purple-600" : ""
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {stage === 5 && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <button
                  type="button"
                  onClick={() => setShowCustomize(!showCustomize)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Make it yours (optional)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Cover colours, your voice, and branding. Skip it and we choose for you.
                    </div>
                  </div>
                  {showCustomize ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {showCustomize && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 mt-3 border-t border-slate-100 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Brand Palette
                      </label>
                      <select
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      >
                        <option value="Emerald & Slate">Emerald & Slate (Clean Modern)</option>
                        <option value="Minimalist Black & White">
                          Minimalist Black & White (Print-Friendly)
                        </option>
                        <option value="Royal Purple & Gold">Royal Purple & Gold</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Writing Voice
                      </label>
                      <input
                        type="text"
                        value={writingVoice}
                        onChange={(e) => setWritingVoice(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleCommitAndBuildStructure}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Regenerate All
                </button>

                <button
                  type="button"
                  onClick={() => setStage(6)}
                  className="px-7 py-3.5 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-sm transition shadow-md inline-flex items-center gap-2"
                >
                  Continue to Content <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {stage === 6 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Generate Your Product Content
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                We'll build your <strong>{activeFormatLabel}</strong> as print-ready A4 pages —
                undated, black-and-white friendly, and finished the moment it downloads.
              </p>
              <div className="text-xs text-slate-700 font-semibold">
                We'll generate your complete {activeFormatLabel} with {structurePages.length} master
                pages.
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGenerateCompleteContent}
                  className="px-8 py-3.5 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-sm transition shadow-md inline-flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" /> Generate Content
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STAGE 7: GENERATED CONTENT ACCORDIONS */}
      {!loadingText && stage === 7 && generatedContentData && (
        <div className="space-y-5">
          <div className="text-center">
            <p className="text-xs text-slate-500">
              Your complete product content, ready to export and sell.
            </p>
          </div>

          <div className="bg-white border border-emerald-200 rounded-3xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-sm">What you're getting</h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-mono">
                  {generatedContentData.summaryText.split(/\s+/).length} words
                </span>
              </div>
              {wallet.planTier === "free" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                  <Clock className="w-3 h-3" /> Saved for 7 days
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {generatedContentData.summaryText}
            </p>
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCopyAllContent}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900"
              >
                {copiedAll ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedAll ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {generatedContentData.pagesContent.map((pg: any) => {
              const isOpen = expandedContentPages.includes(pg.pageNumber);
              return (
                <div
                  key={pg.pageNumber}
                  className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordionPage(pg.pageNumber)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900 text-sm">
                        Page {pg.pageNumber} — {pg.title}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-mono">
                        {pg.wordCount} words
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-2 border-t border-slate-100 bg-slate-50/40">
                      <pre className="whitespace-pre-wrap font-sans text-xs text-slate-700 leading-relaxed">
                        {pg.bodyText}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopyAllContent}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5"
              >
                {copiedAll ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedAll ? "Copied All" : "Copy All"}
              </button>

              <button
                type="button"
                onClick={handleGenerateCompleteContent}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Regenerate
              </button>
            </div>

            <button
              type="button"
              onClick={() => setStage(8)}
              className="px-7 py-3.5 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-sm transition shadow-md inline-flex items-center gap-2"
            >
              Continue to Package & Sell <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 8: PACKAGE SETUP & PACKAGING PROGRESS */}
      {stage === 8 && (
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-2">
            {isRenaming ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editableProductTitle}
                  onChange={(e) => setEditableProductTitle(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-purple-500 text-xs font-bold text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setIsRenaming(false)}
                  className="text-xs font-bold text-purple-700 px-2.5 py-1.5 rounded-lg bg-purple-50"
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsRenaming(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                <Pencil className="w-3.5 h-3.5" /> Rename
              </button>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 text-[#6D28D9]" />
              <h2 className="text-2xl font-extrabold text-slate-900">Your Product Package</h2>
            </div>
            <p className="text-xs text-slate-500">
              Generate your professionally formatted product files.
            </p>
          </div>

          {isPackaging ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-sm">Generating your package</h3>
                <span className="text-xs font-mono text-slate-400">
                  Elapsed: {packagingElapsed}s
                </span>
              </div>

              <div className="space-y-3">
                {PACKAGING_STEPS.map((stepLabel, idx) => {
                  const isDone = idx < packagingStepIdx;
                  const isCurrent = idx === packagingStepIdx;
                  return (
                    <div key={idx} className="flex items-center gap-3 text-xs">
                      {isDone ? (
                        <Check className="w-4 h-4 text-[#6D28D9]" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-[#6D28D9] animate-spin" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-300 inline-block" />
                      )}
                      <span
                        className={
                          isDone
                            ? "line-through text-slate-400"
                            : isCurrent
                            ? "font-bold text-slate-900"
                            : "text-slate-400"
                        }
                      >
                        {stepLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Eye className="w-4 h-4 text-[#6D28D9]" />
                <span>Preview — see your formatted product before you generate</span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-rose-100/70 via-white to-emerald-50/70 p-8 text-center relative overflow-hidden">
                <div className="max-w-sm mx-auto bg-white border border-slate-200 rounded-2xl p-8 shadow-md space-y-3">
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleOpenDesignedDocument(true, false)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
                    >
                      <Eye className="w-3.5 h-3.5" /> Inspect Full A4 Pages
                    </button>
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    {activeFormatLabel} · {structurePages.length} Master Pages
                  </div>
                  <h3 className="text-2xl font-serif font-extrabold text-slate-900 leading-tight">
                    {finalTitle}
                  </h3>
                  {showAuthorInside && (
                    <div className="text-xs font-medium text-slate-500 pt-2">
                      By {displayName || "The Team"}
                    </div>
                  )}
                </div>
                <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-white/90 border border-slate-200 text-[10px] font-mono font-bold text-slate-500">
                  PREVIEW
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Show my name inside the product
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Off makes a fully white-label product — sign-offs read "The Team" instead of your name.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAuthorInside(!showAuthorInside)}
                  className={`w-11 h-6 rounded-full transition p-0.5 ${
                    showAuthorInside ? "bg-[#6D28D9]" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-full bg-white transition transform ${
                      showAuthorInside ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {showAuthorInside && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Author Name <span className="text-rose-600">*</span>{" "}
                    <span className="font-normal text-slate-400">(shown on covers & documents)</span>
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full max-w-md px-4 py-2.5 rounded-xl border border-slate-250 text-xs text-slate-900"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleStartPackaging}
                className="w-full py-4 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-sm transition shadow-md flex items-center justify-center gap-2"
              >
                <Package className="w-4 h-4" /> Generate Product Package
              </button>
            </div>
          )}

          {!isPackaging && (
            <div>
              <button
                type="button"
                onClick={() => setStage(7)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Content
              </button>
            </div>
          )}
        </div>
      )}

      {/* STAGE 9: INDIVIDUAL DELIVERABLES & MULTI-STORE LAUNCH */}
      {stage === 9 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 text-[#6D28D9]" />
              <h2 className="text-2xl font-extrabold text-slate-900">Your Product Package</h2>
            </div>
            <p className="text-xs text-slate-500">
              Your complete product is ready. Download everything you need.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                title: "Product Covers (3 variations)",
                subtitle:
                  "Ready for your store. Upload straight to Selar, Gumroad, or Etsy — matching HTML included.",
                icon: ImageIcon,
                onDownload: () => {
                  const { slug, coverHtml } = buildPackageFiles();
                  triggerDownload(`${slug}-cover.html`, coverHtml, "text/html;charset=utf-8");
                },
              },
              {
                title: "README.txt",
                subtitle: "Quick-start guide for your product package · 1 file",
                icon: FileText,
                onDownload: () => {
                  const { readmeTxt } = buildPackageFiles();
                  triggerDownload("README.txt", readmeTxt);
                },
              },
              {
                title: "START-SELLING.md",
                subtitle:
                  "3 steps to turn this into a listed, sellable product on Selar, Gumroad & Etsy · 1 file",
                icon: FileText,
                onDownload: () => {
                  const { startSellingMd } = buildPackageFiles();
                  triggerDownload("START-SELLING.md", startSellingMd);
                },
              },
              {
                title: "LISTING-COPY.md",
                subtitle: "Listing title, description and SEO tags, ready to paste · 1 file",
                icon: FileText,
                onDownload: () => {
                  const { listingCopyMd } = buildPackageFiles();
                  triggerDownload("LISTING-COPY.md", listingCopyMd);
                },
              },
              {
                title: `${finalTitle} — Designed A4 HTML & Print-Ready PDF`,
                subtitle: `All ${structurePages.length + 4} custom-styled A4 pages (${brandColor}) with visual trackers`,
                icon: BookOpen,
                onDownload: () => {
                  const { slug, designedProductHtml } = buildPackageFiles();
                  triggerDownload(
                    `${slug}-designed-product.html`,
                    designedProductHtml,
                    "text/html;charset=utf-8"
                  );
                },
                extraAction: {
                  label: "Export PDF",
                  onClick: () => handleOpenDesignedDocument(false, true),
                },
              },
            ].map((file, idx) => {
              const Icon = file.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-purple-100/70 text-[#6D28D9] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{file.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{file.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {"extraAction" in file && file.extraAction && (
                      <button
                        type="button"
                        onClick={file.extraAction.onClick}
                        className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6D28D9] text-xs font-bold inline-flex items-center gap-1.5 transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> {file.extraAction.label}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={file.onDownload}
                      className="px-4 py-2 rounded-xl border border-slate-250 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold inline-flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-2 text-center">
            <button
              type="button"
              onClick={handleDownloadCompleteZip}
              className="w-full py-4 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-sm transition shadow-md flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Download Complete Package (ZIP)
            </button>
            <button
              type="button"
              onClick={handleStartPackaging}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5 pt-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-generate package files · free
            </button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStage(7)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Content
            </button>

            <button
              type="button"
              onClick={() => {
                setStage(10);
                if (!pricingData) {
                  handleFetchPricingAndBuyerData(false);
                }
              }}
              className="px-7 py-3.5 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-sm transition shadow-md inline-flex items-center gap-2"
            >
              Continue to Pricing <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 10: PRICING STRATEGY */}
      {stage === 10 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-slate-900">Pricing Strategy</h2>
            <p className="text-xs text-slate-500 mt-1">{finalTitle}</p>
          </div>

          {isGeneratingPricing || !pricingData ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm space-y-3">
              <Loader2 className="w-8 h-8 text-[#6D28D9] animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">
                Benchmarking Selar (₦) and Tier-1 ($) market comparables...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Recommended Price Points */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
                <h3 className="text-base font-extrabold text-slate-900">
                  Recommended Price Points
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl border border-slate-200 bg-white text-center space-y-2 flex flex-col justify-center">
                    <span className="text-xs font-semibold text-slate-500">Low</span>
                    <div className="text-3xl font-black text-slate-900">
                      {pricingData.pricePoints.low.ngn}
                    </div>
                    <div className="text-sm font-bold text-slate-500 font-mono">
                      {pricingData.pricePoints.low.usd}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                      {pricingData.pricePoints.low.desc}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/40 text-center space-y-2 relative flex flex-col justify-center shadow-sm">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                      Recommended
                    </span>
                    <span className="text-xs font-semibold text-slate-600 pt-1">Mid</span>
                    <div className="text-3xl font-black text-slate-900">
                      {pricingData.pricePoints.mid.ngn}
                    </div>
                    <div className="text-sm font-bold text-emerald-700 font-mono">
                      {pricingData.pricePoints.mid.usd}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                      {pricingData.pricePoints.mid.desc}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl border border-slate-200 bg-white text-center space-y-2 flex flex-col justify-center">
                    <span className="text-xs font-semibold text-slate-500">Premium</span>
                    <div className="text-3xl font-black text-slate-900">
                      {pricingData.pricePoints.premium.ngn}
                    </div>
                    <div className="text-sm font-bold text-slate-500 font-mono">
                      {pricingData.pricePoints.premium.usd}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                      {pricingData.pricePoints.premium.desc}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
                  <strong className="text-slate-900">Rationale: </strong>
                  {pricingData.pricePoints.rationale}
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-1">
                  <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" /> Grounded in the market
                  </div>
                  <p className="text-emerald-950/80 text-[11px]">
                    {pricingData.pricePoints.marketBenchmarkNote}
                  </p>
                </div>
              </div>

              {/* Launch Plan */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Launch plan (optional)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1">
                    <span className="text-[11px] font-bold text-purple-700">
                      Optional first-week discount
                    </span>
                    <div className="text-2xl font-black text-slate-900">
                      {pricingData.launchPlan.firstWeekDiscount.ngn}{" "}
                      <span className="text-sm font-mono font-bold text-purple-700">
                        ({pricingData.launchPlan.firstWeekDiscount.usd})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Offer a launch discount for your first week; you decide.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                    <span className="text-[11px] font-bold text-emerald-700">Launch Price</span>
                    <div className="text-2xl font-black text-slate-900">
                      {pricingData.launchPlan.launchPrice.ngn}{" "}
                      <span className="text-sm font-mono font-bold text-emerald-700">
                        ({pricingData.launchPlan.launchPrice.usd})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">During launch week</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold text-slate-500">Everyday price</span>
                    <div className="text-2xl font-black text-slate-900">
                      {pricingData.launchPlan.everydayPrice.ngn}{" "}
                      <span className="text-sm font-mono font-bold text-slate-600">
                        ({pricingData.launchPlan.everydayPrice.usd})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">Standard price after launch</p>
                  </div>
                </div>
              </div>

              {/* Simple Tips for Setting Your Price */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900">
                  % Simple tips for setting your price
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      End USD prices in 9 ($19, $29) and Naira prices in 500 (₦4,500, ₦6,500)
                      because buyers are used to seeing digital downloads priced this way.
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      Show the main core price first so your launch discount looks like immediate
                      high value.
                    </span>
                  </div>
                </div>
              </div>

              {/* Ideas for Selling Products Together */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <Package className="w-4 h-4 text-emerald-600" /> Ideas for selling products
                      together
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Selling several of your products together for one price. These are ideas, not
                      files.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      {pricingData.bundleIdea.bundleTitle}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {pricingData.bundleIdea.includes}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-base font-black text-emerald-700 font-mono">
                      {pricingData.bundleIdea.bundlePriceNGN} /{" "}
                      {pricingData.bundleIdea.bundlePriceUSD}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600">
                      {pricingData.bundleIdea.savingsLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Extras You Could Sell to Buyers + Cheaper Option Ideas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Extras you could sell to buyers
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Bigger extras you would offer after someone buys. You would have to make them
                      yourself.
                    </p>
                  </div>

                  {pricingData?.upsellExtra && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-900 text-xs">
                          {pricingData.upsellExtra.title}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          {pricingData.upsellExtra.desc}
                        </p>
                      </div>
                      <div className="text-right font-mono font-black text-emerald-600 text-sm shrink-0">
                        <div>{pricingData.upsellExtra.priceNGN}</div>
                        <div className="text-xs">{pricingData.upsellExtra.priceUSD}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Cheaper option ideas</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      A lighter, cheaper version for people who find your price too high.
                    </p>
                  </div>

                  {pricingData?.cheaperDownsell && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-900 text-xs">
                          {pricingData.cheaperDownsell.title}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          {pricingData.cheaperDownsell.desc}
                        </p>
                      </div>
                      <div className="text-right font-mono font-black text-slate-700 text-sm shrink-0">
                        <div>{pricingData.cheaperDownsell.priceNGN}</div>
                        <div className="text-xs">{pricingData.cheaperDownsell.priceUSD}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* What's Next? Workflow Strip */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">What's Next?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href={`/dashboard/sales-page?title=${encodeURIComponent(finalTitle)}`}
                className="p-4 rounded-2xl border border-slate-200 hover:border-purple-500 flex items-center justify-between text-xs font-bold text-slate-800 transition"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" /> Create Sales Page
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href={`/dashboard/email-builder?title=${encodeURIComponent(finalTitle)}`}
                className="p-4 rounded-2xl border border-slate-200 hover:border-purple-500 flex items-center justify-between text-xs font-bold text-slate-800 transition"
              >
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-sky-600" /> Build Email Funnel
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href={`/dashboard/launch-advisor?title=${encodeURIComponent(finalTitle)}`}
                className="p-4 rounded-2xl border border-slate-200 hover:border-purple-500 flex items-center justify-between text-xs font-bold text-slate-800 transition"
              >
                <span className="flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-purple-600" /> Get Launch Plan
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => handleFetchPricingAndBuyerData(true)}
              className="px-4 py-2.5 rounded-xl border border-purple-200 bg-purple-50/40 hover:bg-purple-50 text-purple-700 text-xs font-bold transition"
            >
              Regenerate Pricing · 5 credits
            </button>

            <button
              type="button"
              onClick={() => setStage(11)}
              className="px-7 py-3.5 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-sm transition shadow-md inline-flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Complete Product
            </button>
          </div>
        </div>
      )}

      {/* STAGE 11: COMPLETE PRODUCT PAGE */}
      {stage === 11 && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-purple-100 text-[#6D28D9] flex items-center justify-center mx-auto">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Download your product</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Grab every file in your package as a ZIP, ready to upload to your store and start
              selling.
            </p>

            <div className="max-w-md mx-auto space-y-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadCompleteZip}
                className="w-full py-4 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-sm transition shadow-md flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download Complete Package (ZIP)
              </button>

              <div>
                <button
                  type="button"
                  onClick={() => setStage(9)}
                  className="text-xs font-bold text-slate-700 hover:text-purple-700 inline-flex items-center gap-1.5 transition"
                >
                  View individual files <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Where Your Buyers Are */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-purple-100 text-[#6D28D9] flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Where your buyers are</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  The communities, creators and forums already talking about "{niche}". Included
                  with your product — no credits used.
                </p>
              </div>
            </div>

            {pricingData?.buyerVoice?.exactQuotes && (
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Their exact words</h4>
                  <p className="text-[11px] text-slate-400">
                    Real buyer pain-point quotes and questions in your niche.
                  </p>
                </div>

                <div className="space-y-3">
                  {pricingData.buyerVoice.exactQuotes.map((q: any, i: number) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-2"
                    >
                      <p className="text-xs text-slate-800 leading-relaxed">“{q.quote}”</p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-600">{q.author}</span>
                        <span className="inline-flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" /> {q.likes}
                        </span>
                        <span>on “{q.sourceTitle}”</span>
                      </div>
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-semibold">
                          {q.intentTag}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pricingData?.buyerVoice?.whatTheySearch && (
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900">
                  <Search className="w-3.5 h-3.5 text-purple-600" />
                  <span>What they search</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pricingData.buyerVoice.whatTheySearch.map((term: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {pricingData?.buyerVoice?.doThisNow && (
              <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Do this now</span>
                </div>
                <div className="space-y-2.5 text-xs text-slate-700">
                  {pricingData.buyerVoice.doThisNow.map((step: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <span className="h-5 w-5 rounded-full bg-purple-100 text-purple-800 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp Upgrade Banner */}
          <div className="bg-purple-50/80 border border-purple-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">
                Ready to build your next product? Top up or upgrade via WhatsApp.
              </h3>
              <p className="text-xs text-slate-600 max-w-xl">
                Creator plans include 100–500 monthly wallet credits for ebooks, Notion systems,
                sales pages, email funnels, and launch plans on repeat.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setUpgradeReason("MANUAL_UPGRADE")}
              className="px-5 py-3 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold shrink-0 shadow-sm inline-flex items-center gap-1.5"
            >
              Subscribe via WhatsApp <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* What's Next */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">What's Next?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href={`/dashboard/sales-page?title=${encodeURIComponent(finalTitle)}`}
                className="p-4 rounded-2xl border border-slate-200 hover:border-purple-500 flex items-center justify-between text-xs font-bold text-slate-800 transition"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" /> Create Sales Page
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href={`/dashboard/email-builder?title=${encodeURIComponent(finalTitle)}`}
                className="p-4 rounded-2xl border border-slate-200 hover:border-purple-500 flex items-center justify-between text-xs font-bold text-slate-800 transition"
              >
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-sky-600" /> Build Email Funnel
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href={`/dashboard/launch-advisor?title=${encodeURIComponent(finalTitle)}`}
                className="p-4 rounded-2xl border border-slate-200 hover:border-purple-500 flex items-center justify-between text-xs font-bold text-slate-800 transition"
              >
                <span className="flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-purple-600" /> Get Launch Plan
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Multi-Platform Storefront Launcher */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Ready to start selling? List it on your store.
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Start locally on Selar for Naira bank transfers, then list on Gumroad and Etsy for
                  global USD buyers.
                </p>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold self-start">
                {(["Selar", "Gumroad", "Etsy"] as const).map((store) => (
                  <button
                    key={store}
                    type="button"
                    onClick={() => setSelectedStoreTab(store)}
                    className={`px-3.5 py-1.5 rounded-lg transition ${
                      selectedStoreTab === store
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {store}
                  </button>
                ))}
              </div>
            </div>

            {selectedStoreTab === "Selar" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" /> Instant Naira payouts via
                    Nigerian bank transfer & USSD
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" /> Zero monthly fee — free to list
                    digital downloads
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" /> Automatic file delivery to
                    buyer's email & WhatsApp
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" /> Also supports USD, GBP, and GHS
                    international cards
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
                  <div className="font-bold text-slate-900">How it works on Selar:</div>
                  <div>
                    1. Open your free account at selar.com and click{" "}
                    <strong>Add Product → Digital Product</strong>
                  </div>
                  <div>2. Upload your cover image and product file from the ZIP above</div>
                  <div>
                    3. Paste the title & description from <code>LISTING-COPY.md</code> and set
                    your Naira price
                  </div>
                  <div>4. Publish and share your link on WhatsApp Status & X</div>
                </div>

                <a
                  href="https://selar.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2"
                >
                  Start selling on Selar (Nigeria & Africa) <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {selectedStoreTab === "Gumroad" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-pink-600" /> Built-in global discovery
                    marketplace for Notion & PDFs
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-pink-600" /> Accepts global Stripe, PayPal, and
                    Apple Pay checkouts
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-pink-600" /> Supports Pay-What-You-Want & order
                    bump upsells
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-pink-600" /> No monthly subscription — 10% flat
                    fee only when you sell
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
                  <div className="font-bold text-slate-900">How it works on Gumroad:</div>
                  <div>
                    1. Create a profile at gumroad.com and click{" "}
                    <strong>New Product → Digital Product</strong>
                  </div>
                  <div>2. Set price in USD ($19–$39) and upload your product files</div>
                  <div>
                    3. Paste your description from <code>LISTING-COPY.md</code> and publish
                  </div>
                </div>

                <a
                  href="https://gumroad.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2"
                >
                  Start selling on Gumroad (Global USD) <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {selectedStoreTab === "Etsy" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-600" /> Buyers are already searching
                    there — no audience needed
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-600" /> Digital downloads delivered
                    automatically after checkout
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-600" /> $0.20 one-time listing fee, then
                    6.5% transaction fee
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-600" /> High organic search traffic for
                    planners & trackers
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
                  <div className="font-bold text-slate-900">How it works on Etsy:</div>
                  <div>1. Open your shop at etsy.com/sell</div>
                  <div>
                    2. Add a listing and choose <strong>"Digital files"</strong>
                  </div>
                  <div>
                    3. Upload the files you just downloaded and paste tags from{" "}
                    <code>LISTING-COPY.md</code>
                  </div>
                </div>

                <a
                  href="https://www.etsy.com/sell"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2"
                >
                  Start selling on Etsy (Search Traffic) <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>

          {/* Launch-Day Checklist */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-purple-100 text-[#6D28D9] flex items-center justify-center shrink-0">
                <ListChecks className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Get paid & deliver — your launch-day checklist
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Five ticks and a stranger can pay you while you sleep.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {LAUNCH_DAY_CHECKLIST.map((item) => {
                const isChecked = completedChecklistIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3.5 ${
                      isChecked
                        ? "bg-emerald-50/50 border-emerald-200"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${
                        isChecked
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-purple-400"
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                    </div>
                    <div>
                      <div
                        className={`text-xs font-bold ${
                          isChecked ? "line-through text-slate-400" : "text-slate-900"
                        }`}
                      >
                        {item.title}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              href="/dashboard/discovery"
              className="px-5 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
            >
              Back to Dashboard
            </Link>

            <button
              type="button"
              onClick={() => setStage(1)}
              className="px-7 py-3.5 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-sm transition shadow-md inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Build Another Product
            </button>
          </div>
        </div>
      )}

      {/* RATING MODAL */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-7 text-center space-y-5 shadow-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setShowRatingModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
              title="Close without rating"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 font-black text-2xl flex items-center justify-center mx-auto shadow-md">
              T
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900">How was TrendCartel?</h3>
              <p className="text-xs text-slate-500 mt-1">Your product is ready. Tap the stars.</p>
            </div>

            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingStars(star)}
                  className="p-1 transition transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= ratingStars ? "text-amber-400 fill-amber-400" : "text-slate-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={ratingFeedback}
              onChange={(e) => setRatingFeedback(e.target.value)}
              placeholder="Anything to add? (optional)"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-purple-600"
            />

            <label className="flex items-start gap-2 text-left text-[11px] text-slate-500 cursor-pointer">
              <input
                type="checkbox"
                checked={ratingPublicConsent}
                onChange={(e) => setRatingPublicConsent(e.target.checked)}
                className="mt-0.5 rounded text-purple-600"
              />
              <span>Show my review on TrendCartel.</span>
            </label>

            <button
              type="button"
              onClick={handleSendReview}
              disabled={ratingStars === 0}
              className="w-full py-3.5 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] disabled:opacity-50 text-white font-bold text-sm transition shadow-md"
            >
              Send my review
            </button>
          </div>
        </div>
      )}

      {/* WHATSAPP SUBSCRIPTION & UPGRADE MODAL */}
      <UpgradePlanModal
        isOpen={upgradeReason !== null}
        onClose={() => setUpgradeReason(null)}
        currentTier={wallet.planTier}
        currentCredits={wallet.credits}
        userEmail={wallet.email}
        lockReason={upgradeReason || "MANUAL_UPGRADE"}
      />
    </div>
  );
}

export default function MonetisationWizardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-slate-400">Loading Monetisation AI...</div>
      }
    >
      <MonetisationWizardContent />
    </Suspense>
  );
}