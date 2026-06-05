"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Select } from "@/presentation/components/ui/Select";
import { NumberInput } from "@/presentation/components/ui/NumberInput";
import { Button } from "@/presentation/components/ui/Button";
import { DOG_BREEDS, CAT_BREEDS } from "@/shared/constants/breeds";
import { toPng } from "html-to-image";

const FakeQRCode: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`bg-white p-1 rounded-lg border border-neutral-200 dark:border-neutral-700 shrink-0 shadow-xs ${className}`}>
    <svg className="w-full h-full text-neutral-900" viewBox="0 0 24 24" fill="currentColor">
      {/* Top-left position block */}
      <path d="M2 2h5v5H2V2zm1 1v3h3V3H3z" />
      <path d="M4 4h1v1H4V4z" />
      {/* Top-right position block */}
      <path d="M17 2h5v5h-5V2zm1 1v3h3V3H18z" />
      <path d="M19 4h1v1H19V4z" />
      {/* Bottom-left position block */}
      <path d="M2 17h5v5H2v-5zm1 1v3h3v-3H3z" />
      <path d="M4 19h1v1H4v-1z" />
      {/* Random QR code pixels */}
      <path d="M9 2h2v2H9zM13 3h2v2h-2zM9 6h3v2H9zM12 9h2v2h-2zM9 12h2v2H9zM14 13h2v2h-2z" />
      <path d="M16 10h2v2h-2zM19 11h2v3h-2zM21 9h2v2h-2zM17 15h2v3h-2zM20 16h2v2h-2z" />
      <path d="M10 16h2v2h-2zM9 19h3v2H9zM14 20h2v2h-2zM17 20h2v2h-2zM20 20h2v2h-2z" />
    </svg>
  </div>
);

export const PetIdCreatorSection: React.FC = () => {
  const { t } = useTranslation();
  
  // Interactive inputs state
  const [petName, setPetName] = useState("Max");
  const [petType, setPetType] = useState<"dog" | "cat">("dog");
  const [petGender, setPetGender] = useState<"male" | "female">("male");
  const [petBreed, setPetBreed] = useState("poodle");
  const [petWeight, setPetWeight] = useState<number>(5);
  const [petAge, setPetAge] = useState<number>(3);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // References for 3D card tilt animation
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Motion values for mouse hover tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring animations for smooth tilt transitions
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left - width / 2;
    const mouseY = event.clientY - rect.top - height / 2;
    
    // Normalize values between -0.5 and 0.5
    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      // Temporarily reset 3D rotation to ensure flat capture
      const originalX = x.get();
      const originalY = y.get();
      x.set(0);
      y.set(0);

      // Wait a short moment for Framer Motion spring to fully settle back to 0
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Detect active theme
      const isDark = document.documentElement.classList.contains("dark");

      const width = cardRef.current.offsetWidth;
      const height = cardRef.current.offsetHeight;

      const dataUrl = await toPng(cardRef.current, {
        backgroundColor: "transparent",
        width: width * 3,
        height: height * 3,
        style: {
          transform: "scale(3)",
          transformOrigin: "top left",
          width: width + "px",
          height: height + "px",
          transformStyle: "flat",
          // Force inject CSS variables so they resolve inside the isolated clone scope
          "--card": isDark ? "#2D201A" : "#FFFFFF",
          "--foreground": isDark ? "#F5EFE6" : "#3E2E25",
          "--border": isDark ? "#4C3A30" : "#EDE5DC",
          "--muted": isDark ? "#B3A194" : "#A89587",
          "--primary": isDark ? "#EAA85E" : "#C96D2E",
          // Fallback solid styling for root container
          background: isDark ? "#2D201A" : "#FFFFFF",
          color: isDark ? "#F5EFE6" : "#3E2E25",
        } as any,
        cacheBust: true,
      });

      // Restore tilt settings
      x.set(originalX);
      y.set(originalY);

      const link = document.createElement("a");
      link.download = `${petName.trim() || "pet"}_pawdar_id.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to download pet card:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Human age calculation formula
  const calculateHumanAge = (): number => {
    if (petAge <= 0) return 0;
    
    // Year 1 is ~15 human years
    if (petAge === 1) return 15;
    
    // Year 2 is ~24 human years
    if (petAge === 2) return 24;

    // Subsequent years
    const extraYears = petAge - 2;
    if (petType === "cat") {
      return 24 + extraYears * 4;
    } else {
      if (petWeight < 10) {
        return 24 + extraYears * 4;
      } else if (petWeight <= 25) {
        return 24 + extraYears * 5;
      } else {
        return 24 + extraYears * 6;
      }
    }
  };

  const humanAge = calculateHumanAge();

  // Life stage and health tip retrieval based on computed values
  const getStageAndTipKeys = () => {
    if (petType === "dog") {
      if (petAge < 1) {
        return { stage: "idStagePuppy", tip: "idTipPuppy" };
      } else if (petAge <= 9) {
        return { stage: "idStageAdultDog", tip: "idTipAdultDog" };
      } else {
        return { stage: "idStageSeniorDog", tip: "idTipSeniorDog" };
      }
    } else {
      if (petAge < 1) {
        return { stage: "idStageKitten", tip: "idTipKitten" };
      } else if (petAge <= 9) {
        return { stage: "idStageAdultCat", tip: "idTipAdultCat" };
      } else {
        return { stage: "idStageSeniorCat", tip: "idTipSeniorCat" };
      }
    }
  };

  const { stage, tip } = getStageAndTipKeys();

  // Find active breed label
  const activeBreedsList = petType === "dog" ? DOG_BREEDS : CAT_BREEDS;
  const selectedBreedObj = activeBreedsList.find((b) => b.value === petBreed);
  const selectedBreedLabel = selectedBreedObj ? selectedBreedObj.label.split(" ")[0] : "";

  return (
    <section className="relative py-20 lg:py-28 select-none bg-background transition-colors duration-300">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="container mx-auto px-6 z-10 relative">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          
          {/* Left Column: Input Form & Life Recommendations */}
          <div className="lg:col-span-6 flex flex-col gap-8">
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <span className="section-sub shadow-xs mb-4">
                {t("landing.idBadge")}
              </span>
              <h2 className="section-title text-3xl sm:text-4xl md:text-5xl mt-3 mb-4 leading-tight">
                {t("landing.idTitle")}
              </h2>
              <p className="section-desc text-base sm:text-lg max-w-xl">
                {t("landing.idSubtitle")}
              </p>
            </div>

            {/* Configurator Card */}
            <div className="p-6 md:p-8 rounded-3xl border border-border/40 dark:border-border/10 bg-card shadow-xs flex flex-col gap-6">
              
              {/* Pet Name & Pet Type Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-foreground">{t("landing.idLabelName")}</label>
                  <input
                    type="text"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value || "")}
                    className="px-4 py-3 rounded-xl border border-border/50 dark:border-border/20 bg-background text-foreground text-sm font-semibold focus:outline-none focus:border-primary/50"
                    placeholder="Max"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-foreground">{t("landing.idLabelType")}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setPetType("dog");
                        setPetBreed(DOG_BREEDS[0].value);
                        setUploadedImage(null);
                      }}
                      className={`py-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        petType === "dog"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 bg-background text-muted/80 hover:text-foreground"
                      }`}
                    >
                      <span>🐶</span> {t("landing.dog")}
                    </button>
                    <button
                      onClick={() => {
                        setPetType("cat");
                        setPetBreed(CAT_BREEDS[0].value);
                        setUploadedImage(null);
                      }}
                      className={`py-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        petType === "cat"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 bg-background text-muted/80 hover:text-foreground"
                      }`}
                    >
                      <span>🐱</span> {t("landing.cat")}
                    </button>
                  </div>
                </div>
              </div>

              {/* Breed & Gender Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label={t("landing.idLabelBreed")}
                  options={activeBreedsList}
                  value={petBreed}
                  onChange={setPetBreed}
                />
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-foreground">{t("landing.idLabelGender")}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPetGender("male")}
                      className={`py-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                        petGender === "male"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 bg-background text-muted/80 hover:text-foreground"
                      }`}
                    >
                      {t("landing.idGenderMale")}
                    </button>
                    <button
                      onClick={() => setPetGender("female")}
                      className={`py-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                        petGender === "female"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 bg-background text-muted/80 hover:text-foreground"
                      }`}
                    >
                      {t("landing.idGenderFemale")}
                    </button>
                  </div>
                </div>
              </div>

              {/* Image upload */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-foreground">{t("landing.idLabelPhoto")}</label>
                <div className="flex items-center gap-4">
                  <label className="px-4 py-2.5 rounded-xl border border-dashed border-border hover:border-primary text-xs font-bold bg-background text-muted/80 hover:text-foreground cursor-pointer transition-all shrink-0">
                    <span>📁 {t("landing.idUploadPlaceholder")}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {uploadedImage && (
                    <div className="flex items-center gap-2">
                      <img
                        src={uploadedImage}
                        alt="Preview"
                        className="w-10 h-10 rounded-lg object-cover border border-border"
                      />
                      <button
                        onClick={() => setUploadedImage(null)}
                        className="text-xs font-bold text-red-500 hover:text-red-600 cursor-pointer"
                      >
                        {t("landing.idClearPhoto")}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Age & Weight Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NumberInput
                  label={t("landing.idLabelAge")}
                  min={0}
                  max={30}
                  step={0.5}
                  value={petAge}
                  onChange={setPetAge}
                  placeholder="3"
                />
                <NumberInput
                  label={t("landing.idLabelWeight")}
                  min={0.1}
                  max={100}
                  step={0.1}
                  value={petWeight}
                  onChange={setPetWeight}
                  placeholder="5"
                />
              </div>

            </div>
          </div>

          {/* Right Column: Flat Monochromatic Card & Tips Display */}
          <div className="lg:col-span-6 flex flex-col items-center gap-8 relative">
            
            {/* 3D card container (Enlarged) */}
            <div
              className="relative w-full max-w-[420px] md:max-w-[480px] aspect-1.5/1 cursor-pointer select-none rounded-4xl"
              style={{ perspective: "1000px" }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <motion.div
                ref={cardRef}
                style={{
                  rotateX,
                  rotateY,
                  transformStyle: "preserve-3d",
                }}
                className="relative w-full h-full rounded-4xl border border-border bg-card p-6 md:p-8 shadow-xl overflow-hidden flex flex-col justify-between transition-shadow duration-350 hover:shadow-2xl"
              >
                {/* Card Header */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🐾</span>
                    <span className="text-sm font-black uppercase tracking-[0.25em] text-foreground leading-none">Pawdar ID</span>
                  </div>
                  
                  {/* Fake QR Code */}
                  <FakeQRCode className="w-12 h-12 md:w-14 md:h-14" />
                </div>

                {/* Card Main Info */}
                <div className="grid grid-cols-12 gap-2 my-auto items-start">
                  
                  {/* Photo Avatar */}
                  <div className="col-span-4 flex items-start justify-start">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-secondary/15 dark:bg-neutral-800 border border-border/50 flex items-center justify-center shadow-inner overflow-hidden shrink-0">
                      {uploadedImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={uploadedImage} alt="Pet Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-5xl md:text-6xl select-none">{petType === "dog" ? "🐕" : "🐈"}</span>
                      )}
                    </div>
                  </div>

                  {/* Details Row */}
                  <div className="col-span-8 flex flex-col gap-3.5 text-left pl-2">
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-muted">{t("landing.idLabelName")}</div>
                      <div className="text-xl font-black text-foreground wrap-break-word leading-tight mt-1">
                        {petName || "..."}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-y-2.5 gap-x-4 mt-2">
                      <div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-muted">{t("landing.idCardLabelAge")}</div>
                        <div className="text-xs font-bold text-foreground mt-0.5">
                          {petAge} {petAge === 1 ? t("landing.idUnitYear") : t("landing.idUnitYears")}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-muted">{t("landing.idCardLabelHumanYrs")}</div>
                        <div className="text-xs font-bold text-primary mt-0.5">≈ {humanAge}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-muted">{t("landing.idLabelBreed")}</div>
                        <div className="text-xs font-bold text-foreground mt-0.5 truncate max-w-[85px]" title={selectedBreedLabel}>
                          {selectedBreedLabel || "..."}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-muted">{t("landing.idCardLabelGender")}</div>
                        <div className="text-xs font-bold text-foreground mt-0.5">
                          {petGender === "male" ? t("landing.idGenderMale") : t("landing.idGenderFemale")}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-muted">{t("landing.idCardLabelWeight")}</div>
                        <div className="text-xs font-bold text-foreground mt-0.5">
                          {petWeight} kg
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Barcode & Development Stage */}
                <div className="flex justify-between items-end border-t border-border/60 pt-4">
                  <div className="flex flex-col text-left pr-2 grow">
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted">{t("landing.idLifeStage")}</span>
                    <span className="text-xs font-bold text-foreground mt-0.5 whitespace-normal wrap-break-word leading-tight">
                      {t(`landing.${stage}`)}
                    </span>
                  </div>
                  {/* Pseudo Barcode */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex gap-[1.5px] h-6 items-end opacity-75">
                      <div className="w-[1.5px] h-full bg-foreground" />
                      <div className="w-[2.5px] h-full bg-foreground" />
                      <div className="w-px h-4 bg-foreground" />
                      <div className="w-[1.5px] h-full bg-foreground" />
                      <div className="w-[3px] h-3 bg-foreground" />
                      <div className="w-px h-full bg-foreground" />
                      <div className="w-[2px] h-4 bg-foreground" />
                      <div className="w-px h-full bg-foreground" />
                    </div>
                    <span className="text-[7px] font-mono tracking-widest text-muted leading-none">PWD-{petType === "dog" ? "DOG" : "CAT"}-0026</span>
                  </div>
                </div>

              </motion.div>
            </div>

            <Button
              variant="primary"
              size="md"
              isLoading={isDownloading}
              onClick={handleDownload}
              className="w-full max-w-[420px] md:max-w-[480px] rounded-2xl cursor-pointer"
            >
              {t("landing.idDownloadCTA")}
            </Button>

            {/* Healthcare recommendation card beneath the ID */}
            <motion.div
              key={tip}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-[420px] md:max-w-[480px] p-5 rounded-2xl border border-success/20 dark:border-success/10 bg-success/5 text-left flex gap-3.5 shadow-[0_4px_24px_rgba(34,197,94,0.02)] select-none"
            >
              <span className="text-2xl mt-0.5 shrink-0 select-none">💡</span>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-success mb-1.5 leading-none">CARE GUIDANCE</span>
                <p className="text-xs font-medium text-muted leading-relaxed select-none">
                  {t(`landing.${tip}`)}
                </p>
              </div>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default PetIdCreatorSection;
