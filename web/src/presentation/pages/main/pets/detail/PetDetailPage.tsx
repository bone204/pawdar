"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { useGetPetByIdQuery, useDeletePetGalleryMutation } from "@/infrastructure/rtk/api/pet.api";
import { useGetBreedByIdQuery } from "@/infrastructure/rtk/api/breed.api";
import { Button } from "@/presentation/components/ui/Button";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import { PetFormModal } from "../modal/PetFormModal";
import { PetGalleryFormModal } from "../modal/PetGalleryFormModal";
import { Toast } from "../MyPetsPage";

interface PetDetailPageProps {
  id: string;
}

const FakeQRCode: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`bg-white p-1 rounded-lg border border-neutral-200 dark:border-neutral-700 shrink-0 shadow-xs ${className}`}>
    <svg className="w-full h-full text-neutral-900" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 2h5v5H2V2zm1 1v3h3V3H3z" />
      <path d="M4 4h1v1H4V4z" />
      <path d="M17 2h5v5h-5V2zm1 1v3h3V3H18z" />
      <path d="M19 4h1v1H19V4z" />
      <path d="M2 17h5v5H2v-5zm1 1v3h3v-3H3z" />
      <path d="M4 19h1v1H4v-1z" />
      <path d="M9 2h2v2H9zM13 3h2v2h-2zM9 6h3v2H9zM12 9h2v2h-2zM9 12h2v2H9zM14 13h2v2h-2z" />
      <path d="M16 10h2v2h-2zM19 11h2v3h-2zM21 9h2v2h-2zM17 15h2v3h-2zM20 16h2v2h-2z" />
      <path d="M10 16h2v2h-2zM9 19h3v2H9zM14 20h2v2h-2zM17 20h2v2h-2zM20 20h2v2h-2z" />
    </svg>
  </div>
);

export const PetDetailPage: React.FC<PetDetailPageProps> = ({ id }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: pet, isLoading, isError } = useGetPetByIdQuery(id, {
    skip: !id,
  });

  const { data: breed } = useGetBreedByIdQuery(pet?.breedId || "", {
    skip: !pet?.breedId,
  });

  const [isDownloading, setIsDownloading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Gallery States
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [editingGalleryImage, setEditingGalleryImage] = useState<any>(null);
  const [deletingGalleryImage, setDeletingGalleryImage] = useState<any>(null);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [isAvatarPreviewOpen, setIsAvatarPreviewOpen] = useState(false);
  const [deletePetGallery, { isLoading: isDeletingGallery }] = useDeletePetGalleryMutation();

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
    
    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleDownload = async () => {
    if (!cardRef.current || !pet) return;
    setIsDownloading(true);
    try {
      const originalX = x.get();
      const originalY = y.get();
      x.set(0);
      y.set(0);

      await new Promise((resolve) => setTimeout(resolve, 200));

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
          "--card": isDark ? "#2D201A" : "#FFFFFF",
          "--foreground": isDark ? "#F5EFE6" : "#3E2E25",
          "--border": isDark ? "#4C3A30" : "#EDE5DC",
          "--muted": isDark ? "#B3A194" : "#A89587",
          "--primary": isDark ? "#EAA85E" : "#C96D2E",
          background: isDark ? "#2D201A" : "#FFFFFF",
          color: isDark ? "#F5EFE6" : "#3E2E25",
        } as any,
        cacheBust: true,
      });

      x.set(originalX);
      y.set(originalY);

      const link = document.createElement("a");
      link.download = `${pet.name.trim() || "pet"}_pawdar_id.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to download pet card:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const _onBack = () => {
    router.push("/my-pets");
  };

  const _showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col gap-6 p-4 animate-pulse">
        <div className="bg-card border border-border rounded-3xl p-8 flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 aspect-square bg-secondary/60 rounded-full" />
          <div className="flex-1 flex flex-col gap-4">
            <div className="h-8 bg-secondary/60 rounded-lg w-1/3" />
            <div className="h-4 bg-secondary/40 rounded-lg w-1/2" />
            <div className="grid grid-cols-3 gap-3 my-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-secondary/40 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !pet) {
    return (
      <div className="max-w-md mx-auto text-center py-16 bg-card border border-border rounded-3xl p-8 shadow-sm">
        <span className="text-5xl mb-4 block">🔍</span>
        <h3 className="text-xl font-bold text-foreground mb-2">Không tìm thấy thông tin</h3>
        <p className="text-sm text-muted mb-6">Thú cưng này có thể đã bị xóa hoặc đường dẫn không chính xác.</p>
        <Button variant="primary" onClick={_onBack}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  // Calculation formulas matching landing page ID card generator
  const petAgeYrs = pet.ageMonths != null ? pet.ageMonths / 12 : 0;
  
  const calculateHumanAge = (): number => {
    if (petAgeYrs <= 0) return 0;
    if (petAgeYrs <= 1) return 15;
    if (petAgeYrs <= 2) return 24;
    const extraYears = petAgeYrs - 2;
    if (pet.petType === "cat") {
      return 24 + extraYears * 4;
    } else {
      const petWeight = pet.weightKg ?? 5;
      if (petWeight < 10) {
        return 24 + extraYears * 4;
      } else if (petWeight <= 25) {
        return 24 + extraYears * 5;
      } else {
        return 24 + extraYears * 6;
      }
    }
  };

  const humanAge = Math.round(calculateHumanAge());

  const getStageAndTipKeys = () => {
    if (pet.petType === "dog") {
      if (petAgeYrs < 1) {
        return { stage: "idStagePuppy", tip: "idTipPuppy" };
      } else if (petAgeYrs <= 9) {
        return { stage: "idStageAdultDog", tip: "idTipAdultDog" };
      } else {
        return { stage: "idStageSeniorDog", tip: "idTipSeniorDog" };
      }
    } else {
      if (petAgeYrs < 1) {
        return { stage: "idStageKitten", tip: "idTipKitten" };
      } else if (petAgeYrs <= 9) {
        return { stage: "idStageAdultCat", tip: "idTipAdultCat" };
      } else {
        return { stage: "idStageSeniorCat", tip: "idTipSeniorCat" };
      }
    }
  };

  const { stage, tip } = getStageAndTipKeys();
  const breedLabel = breed?.name || pet.breedId || "Chưa xác định";

  const displayImage = pet.avatarUrl && pet.avatarUrl.startsWith("http")
    ? pet.avatarUrl
    : pet.petType === "dog"
    ? "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop"
    : "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full select-none py-2"
    >
      <div className="grid gap-8 lg:grid-cols-12 lg:items-stretch">
        {/* Left Column: Pet Profile Unified Card */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="w-full h-full bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 relative overflow-hidden">
            {/* Edit Button floating at the top-right */}
            <button
              onClick={() => setIsFormOpen(true)}
              className="absolute top-4 right-4 bg-secondary/50 hover:bg-secondary text-foreground rounded-full w-8 h-8 flex items-center justify-center transition-all cursor-pointer border border-border/40 text-xs hover:scale-105 active:scale-95 z-10"
              title="Chỉnh sửa hồ sơ"
            >
              ✏️
            </button>

            {/* Left Section: Avatar & Basic Info */}
            <div className="flex flex-col items-center shrink-0 md:w-64 md:pt-6">
              {/* Avatar */}
              <div
                onClick={() => setIsAvatarPreviewOpen(true)}
                className="w-44 h-44 md:w-56 md:h-56 rounded-full border-4 border-primary/20 overflow-hidden shadow-md shrink-0 mb-4 cursor-pointer hover:scale-105 hover:border-primary/45 hover:shadow-lg transition-all duration-300 relative group"
                title="Bấm để xem ảnh lớn"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayImage}
                  alt={pet.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-300 text-white select-none">
                  <span className="text-xl">🔍</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest mt-1">Xem ảnh</span>
                </div>
              </div>
              
              {/* Basic Info */}
              <h2 className="text-2xl font-black text-foreground tracking-tight text-center truncate max-w-full" title={pet.name}>
                {pet.name}
              </h2>
              <span className="text-xs font-bold bg-primary/10 text-primary px-3.5 py-1 rounded-full mt-2 inline-block select-none">
                {pet.petType === "dog" ? "🐶 Chó" : "🐱 Mèo"}
              </span>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px bg-border/60 self-stretch my-2" />
            <div className="block md:hidden w-full border-t border-border/60 my-2" />

            {/* Right Section: Premium Stats List */}
            <div className="flex-1 w-full h-full flex flex-col justify-between gap-4 text-sm text-left">
              {/* Giới tính */}
              <div className="flex items-center gap-4 p-4 bg-gender-bg border border-gender-color/15 rounded-2xl transition-all hover:bg-gender-icon-bg shadow-xs">
                <div className="w-11 h-11 rounded-xl bg-gender-icon-bg text-gender-color flex items-center justify-center text-xl shrink-0 select-none">
                  {pet.gender === "male" ? "♂️" : "♀️"}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-muted font-black uppercase tracking-wider block">Giới tính</span>
                  <span className="font-black text-foreground mt-0.5 block text-sm">
                    {pet.gender === "male" ? "Đực" : pet.gender === "female" ? "Cái" : "Chưa xác định"}
                  </span>
                </div>
              </div>

              {/* Giống loài */}
              <div className="flex items-center gap-4 p-4 bg-breed-bg border border-breed-color/15 rounded-2xl transition-all hover:bg-breed-icon-bg shadow-xs">
                <div className="w-11 h-11 rounded-xl bg-breed-icon-bg text-breed-color flex items-center justify-center text-xl shrink-0 select-none">
                  🧬
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-muted font-black uppercase tracking-wider block">Giống loài</span>
                  <span className="font-black text-foreground mt-0.5 block text-sm truncate" title={breedLabel}>
                    {breedLabel}
                  </span>
                </div>
              </div>

              {/* Tuổi đời */}
              <div className="flex items-center gap-4 p-4 bg-age-bg border border-age-color/15 rounded-2xl transition-all hover:bg-age-icon-bg shadow-xs">
                <div className="w-11 h-11 rounded-xl bg-age-icon-bg text-age-color flex items-center justify-center text-xl shrink-0 select-none">
                  🎂
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-muted font-black uppercase tracking-wider block">Tuổi đời</span>
                  <span className="font-black text-foreground mt-0.5 block text-sm">
                    {petAgeYrs.toFixed(1)} tuổi ({pet.ageMonths ?? 0} tháng)
                  </span>
                </div>
              </div>

              {/* Cân nặng */}
              <div className="flex items-center gap-4 p-4 bg-weight-bg border border-weight-color/15 rounded-2xl transition-all hover:bg-weight-icon-bg shadow-xs">
                <div className="w-11 h-11 rounded-xl bg-weight-icon-bg text-weight-color flex items-center justify-center text-xl shrink-0 select-none">
                  ⚖️
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-muted font-black uppercase tracking-wider block">Cân nặng</span>
                  <span className="font-black text-foreground mt-0.5 block text-sm">
                    {pet.weightKg != null ? `${pet.weightKg} kg` : "— kg"}
                  </span>
                </div>
              </div>

              {/* Ngày tham gia */}
              <div className="flex items-center gap-4 p-4 bg-date-bg border border-date-color/15 rounded-2xl transition-all hover:bg-date-icon-bg shadow-xs">
                <div className="w-11 h-11 rounded-xl bg-date-icon-bg text-date-color flex items-center justify-center text-xl shrink-0 select-none">
                  📅
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-muted font-black uppercase tracking-wider block">Ngày tham gia Pawdar</span>
                  <span className="font-black text-foreground mt-0.5 block text-sm">
                    {new Date(pet.createdAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Mô tả / Ghi chú */}
              {pet.description && (
                <div className="flex gap-4 p-4 bg-primary/[0.04] dark:bg-primary/[0.08] border border-primary/10 dark:border-primary/20 rounded-2xl transition-all shadow-xs">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0 select-none">
                    💬
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-muted font-black uppercase tracking-wider block">Mô tả / Ghi chú</span>
                    <p className="text-xs text-muted-foreground font-semibold leading-relaxed italic mt-1">
                      "{pet.description}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Pet ID Card & Recommendations */}
        <div className="lg:col-span-5 flex flex-col items-center gap-6">
          {/* ID Card Wrapper */}
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
                <FakeQRCode className="w-12 h-12 md:w-14 md:h-14" />
              </div>

              {/* Card Body */}
              <div className="grid grid-cols-12 gap-2 my-auto items-start">
                {/* Photo Avatar */}
                <div className="col-span-4 flex items-start justify-start">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-secondary/15 dark:bg-neutral-800 border border-border/50 flex items-center justify-center shadow-inner overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={displayImage} alt="Pet Avatar" className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Details */}
                <div className="col-span-8 flex flex-col gap-3.5 text-left pl-2">
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-muted">{t("landing.idLabelName")}</div>
                    <div className="text-xl font-black text-foreground wrap-break-word leading-tight mt-1">
                      {pet.name}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-y-2.5 gap-x-4 mt-2">
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-muted">{t("landing.idCardLabelAge")}</div>
                      <div className="text-xs font-bold text-foreground mt-0.5">
                        {petAgeYrs.toFixed(1)} {t("landing.idUnitYears")}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-muted">{t("landing.idCardLabelHumanYrs")}</div>
                      <div className="text-xs font-bold text-primary mt-0.5">≈ {humanAge}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-muted">{t("landing.idLabelBreed")}</div>
                      <div className="text-xs font-bold text-foreground mt-0.5 truncate max-w-[85px]" title={breedLabel}>
                        {breedLabel}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-muted">{t("landing.idCardLabelGender")}</div>
                      <div className="text-xs font-bold text-foreground mt-0.5">
                        {pet.gender === "male" ? t("landing.idGenderMale") : t("landing.idGenderFemale")}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-muted">{t("landing.idCardLabelWeight")}</div>
                      <div className="text-xs font-bold text-foreground mt-0.5">
                        {pet.weightKg ?? "—"} kg
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex justify-between items-end border-t border-border/60 pt-4">
                <div className="flex flex-col text-left pr-2 grow">
                  <span className="text-[8px] font-black uppercase tracking-widest text-muted">{t("landing.idLifeStage")}</span>
                  <span className="text-xs font-bold text-foreground mt-0.5 whitespace-normal wrap-break-word leading-tight">
                    {t(`landing.${stage}`)}
                  </span>
                </div>
                {/* Barcode */}
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
                  <span className="text-[7px] font-mono tracking-widest text-muted leading-none">PWD-{pet.petType.toUpperCase()}-0026</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Download button */}
          <Button
            variant="primary"
            isLoading={isDownloading}
            onClick={handleDownload}
            className="w-full max-w-[420px] md:max-w-[480px] rounded-2xl py-3 cursor-pointer text-sm font-bold"
          >
            {t("landing.idDownloadCTA")}
          </Button>

          {/* Care guidance */}
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

      {/* Pet Gallery Section */}
      <div className="border-t border-border mt-16 pt-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl select-none">📸</span>
            <div>
              <h3 className="text-2xl font-black text-foreground">Thư viện ảnh</h3>
              <p className="text-xs text-muted font-bold mt-1">
                {pet.gallery?.length ?? 0} khoảnh khắc đáng nhớ của {pet.name}
              </p>
            </div>
          </div>
          {pet.gallery && pet.gallery.length > 0 && (
            <Button
              variant="primary"
              onClick={() => {
                setEditingGalleryImage(null);
                setIsGalleryOpen(true);
              }}
              className="rounded-xl text-xs font-bold py-2.5 px-4 flex items-center gap-2"
            >
              Thêm ảnh mới ➕
            </Button>
          )}
        </div>

        {!pet.gallery || pet.gallery.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border border-dashed rounded-3xl p-8 select-none">
            <span className="text-5xl mb-4 block">🖼️</span>
            <h4 className="text-base font-bold text-foreground mb-1">Chưa có bức ảnh nào</h4>
            <p className="text-xs text-muted mb-6">Hãy ghi lại những khoảnh khắc đáng yêu đầu tiên của {pet.name} nhé!</p>
            <Button
              variant="secondary"
              onClick={() => {
                setEditingGalleryImage(null);
                setIsGalleryOpen(true);
              }}
              className="rounded-xl text-xs font-bold py-2.5"
            >
              Tải ảnh lên ngay 📸
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {pet.gallery.map((item: any, idx: number) => (
              <div
                key={item.id}
                className="group relative bg-card border border-border rounded-2xl overflow-hidden aspect-square flex flex-col justify-end shadow-sm hover:shadow-md cursor-pointer transition-shadow"
                onClick={() => setActiveLightboxIndex(idx)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.description || "Pet Gallery Image"}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white">
                  <p className="text-xs font-semibold truncate">{item.description || "Khoảnh khắc đáng nhớ"}</p>
                  <span className="text-[10px] opacity-75 font-bold mt-1">
                    📅 {new Date(item.capturedAt).toLocaleDateString("vi-VN")}
                  </span>
                  <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setEditingGalleryImage(item);
                        setIsGalleryOpen(true);
                      }}
                      className="bg-white/20 hover:bg-white/40 text-white rounded-lg p-1.5 transition-colors cursor-pointer text-xs font-bold"
                      title="Chỉnh sửa"
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      onClick={() => setDeletingGalleryImage(item)}
                      className="bg-danger/80 hover:bg-danger text-white rounded-lg p-1.5 transition-colors cursor-pointer text-xs font-bold"
                      title="Xóa"
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <PetFormModal
            isOpen={isFormOpen}
            editingPet={pet}
            onClose={() => setIsFormOpen(false)}
            onSuccess={_showToast}
          />
        )}
        {isGalleryOpen && (
          <PetGalleryFormModal
            isOpen={isGalleryOpen}
            petId={id}
            editingImage={editingGalleryImage}
            onClose={() => setIsGalleryOpen(false)}
            onSuccess={_showToast}
          />
        )}
        {deletingGalleryImage && (
          <DeleteGalleryDialog
            isOpen={!!deletingGalleryImage}
            onConfirm={async () => {
              try {
                await deletePetGallery({ petId: id, id: deletingGalleryImage.id }).unwrap();
                setDeletingGalleryImage(null);
                _showToast("Đã xóa ảnh thành công 🗑️");
              } catch (err) {
                console.error(err);
              }
            }}
            onCancel={() => setDeletingGalleryImage(null)}
            isLoading={isDeletingGallery}
          />
        )}
        {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
      </AnimatePresence>

      {/* Lightbox Overlay */}
      {activeLightboxIndex !== null && pet.gallery && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-center items-center p-4">
          <button
            onClick={() => setActiveLightboxIndex(null)}
            className="absolute top-6 right-6 text-white text-3xl font-bold cursor-pointer bg-white/10 hover:bg-white/20 rounded-full w-12 h-12 flex items-center justify-center transition-colors z-50"
          >
            ✕
          </button>

          {activeLightboxIndex > 0 && (
            <button
              onClick={() => setActiveLightboxIndex(activeLightboxIndex - 1)}
              className="absolute left-6 text-white text-3xl font-bold cursor-pointer bg-white/10 hover:bg-white/20 rounded-full w-12 h-12 flex items-center justify-center transition-colors z-50"
            >
              ‹
            </button>
          )}

          {activeLightboxIndex < pet.gallery.length - 1 && (
            <button
              onClick={() => setActiveLightboxIndex(activeLightboxIndex + 1)}
              className="absolute right-6 text-white text-3xl font-bold cursor-pointer bg-white/10 hover:bg-white/20 rounded-full w-12 h-12 flex items-center justify-center transition-colors z-50"
            >
              ›
            </button>
          )}

          <div className="max-w-4xl max-h-[75vh] flex items-center justify-center relative select-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pet.gallery[activeLightboxIndex].imageUrl}
              alt={pet.gallery[activeLightboxIndex].description || "Lightbox Image"}
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

          <div className="text-center mt-6 max-w-2xl px-4 select-none">
            <p className="text-white text-lg font-semibold">
              {pet.gallery[activeLightboxIndex].description || "Khoảnh khắc đáng nhớ"}
            </p>
            <span className="text-sm text-neutral-400 font-bold mt-2 block">
              📅 Ngày chụp: {new Date(pet.gallery[activeLightboxIndex].capturedAt).toLocaleDateString("vi-VN")}
            </span>
          </div>
        </div>
      )}

      {/* Avatar Preview Lightbox Overlay */}
      {isAvatarPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-center items-center p-4">
          <button
            onClick={() => setIsAvatarPreviewOpen(false)}
            className="absolute top-6 right-6 text-white text-3xl font-bold cursor-pointer bg-white/10 hover:bg-white/20 rounded-full w-12 h-12 flex items-center justify-center transition-colors z-50 animate-in fade-in"
          >
            ✕
          </button>

          <div className="max-w-4xl max-h-[75vh] flex items-center justify-center relative select-none animate-in zoom-in-95 duration-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayImage}
              alt={pet.name}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />
          </div>

          <div className="text-center mt-6 max-w-2xl px-4 select-none animate-in fade-in">
            <p className="text-white text-lg font-semibold">
              Ảnh đại diện của {pet.name}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Delete Gallery Image Confirmation Dialog
// ──────────────────────────────────────────────────────────────────────────────

interface DeleteGalleryDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const DeleteGalleryDialog: React.FC<DeleteGalleryDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  isLoading,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.18 }}
        className="relative w-full max-w-sm bg-card border border-border rounded-3xl p-6 shadow-2xl z-10"
      >
        <div className="text-center mb-5 flex flex-col items-center">
          <div className="text-4xl mb-3">🗑️</div>
          <h3 className="text-lg font-black text-foreground mb-2">Xóa ảnh khỏi thư viện?</h3>
          <p className="text-sm text-muted leading-relaxed">
            Hành động này sẽ xóa vĩnh viễn bức ảnh này khỏi thư viện ảnh của thú cưng. Bạn có chắc chắn?
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-foreground hover:bg-secondary/40 transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <Button
            variant="primary"
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1 bg-danger text-white hover:bg-danger/90 border-danger/10 shadow-none"
          >
            Xóa ảnh
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
