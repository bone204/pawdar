"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { RtkBreedRepository } from "@/infrastructure/repositories/breed.repository";
import { GetBreedsUseCase } from "@/domain/usecases/get-breeds.usecase";
import { BreedEntity } from "@/domain/entities/breed.entity";
import { Button } from "@/presentation/components/ui/Button";
import { TextField } from "@/presentation/components/ui/TextField";

// Instantiate repository and use case following Clean Architecture
const breedRepository = new RtkBreedRepository();
const getBreedsUseCase = new GetBreedsUseCase(breedRepository);

export const BreedsPage: React.FC = () => {
  const { t, locale } = useTranslation();
  const [breeds, setBreeds] = useState<BreedEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters state
  const [petType, setPetType] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 9; // Show 9 breeds per page (grid of 3x3 looks best)

  // Simple debounce for search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to page 1 on new search
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    let isMounted = true;
    const loadBreeds = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch data
        const response = await getBreedsUseCase.execute({
          petType,
          lang: locale,
          search: debouncedSearch.trim() || undefined,
          page,
          limit,
        });

        if (isMounted) {
          setBreeds(response.items);
          setTotalItems(response.total);
          setTotalPages(Math.max(1, Math.ceil(response.total / limit)));
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Failed to load breeds", err);
          setError(err.message || "get_breeds_failed");
        }
      } finally {
        if (isMounted) {
          // Minimal delay to ensure shimmer is visible and transitions are smooth
          setTimeout(() => {
            if (isMounted) setLoading(false);
          }, 300);
        }
      }
    };
    loadBreeds();

    return () => {
      isMounted = false;
    };
  }, [petType, locale, debouncedSearch, page]);

  const _onFilterChange = (type: string | undefined) => {
    setPetType(type);
    setPage(1); // Reset to page 1 on filter change
  };

  const _onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const _onPrevPage = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const _onNextPage = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  return (
    <div className="flex flex-col gap-8 w-full select-none py-2">
      {/* Header section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          {t("breeds.title")}
        </h1>
        <p className="text-sm text-muted font-light max-w-2xl">
          {t("breeds.subtitle")}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-card border border-border rounded-3xl shadow-[0_4px_12px_rgba(0,0,0,0.01)] transition-colors duration-300">
        {/* Tabs for petType */}
        <div className="flex gap-2">
          <Button
            variant={petType === undefined ? "primary" : "secondary"}
            onClick={() => _onFilterChange(undefined)}
            className="rounded-xl px-4 py-2 text-sm font-bold active:scale-95 transition-transform"
          >
            {t("breeds.filterAll")}
          </Button>
          <Button
            variant={petType === "dog" ? "primary" : "secondary"}
            onClick={() => _onFilterChange("dog")}
            className="rounded-xl px-4 py-2 text-sm font-bold active:scale-95 transition-transform"
          >
            {t("breeds.filterDogs")}
          </Button>
          <Button
            variant={petType === "cat" ? "primary" : "secondary"}
            onClick={() => _onFilterChange("cat")}
            className="rounded-xl px-4 py-2 text-sm font-bold active:scale-95 transition-transform"
          >
            {t("breeds.filterCats")}
          </Button>
        </div>

        {/* Search Input */}
        <div className="w-full md:flex-1 md:max-w-xl">
          <TextField
            placeholder={t("breeds.searchPlaceholder")}
            value={searchQuery}
            onChange={_onSearchChange}
            className="w-full rounded-xl"
            leftIcon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            }
          />
        </div>
      </div>

      {/* Breeds Grid or Loading State */}
      {loading ? (
        // Shimmer skeleton layout for card loader
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="bg-card border border-border rounded-3xl p-5 flex flex-col gap-4 animate-pulse"
            >
              <div className="w-full aspect-video bg-secondary/80 rounded-2xl" />
              <div className="h-6 bg-secondary/80 rounded-md w-3/4" />
              <div className="space-y-2">
                <div className="h-4 bg-secondary/50 rounded-md w-full" />
                <div className="h-4 bg-secondary/50 rounded-md w-5/6" />
                <div className="h-4 bg-secondary/50 rounded-md w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card border border-border rounded-3xl text-center">
          <span className="text-4xl mb-4">⚠️</span>
          <h3 className="text-lg font-bold text-foreground mb-2">
            {t(`api.codes.${error}`) || t("api.codes.unknown_error")}
          </h3>
        </div>
      ) : breeds.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card border border-border rounded-3xl text-center">
          <span className="text-4xl mb-4">🔍</span>
          <h3 className="text-lg font-bold text-foreground">
            {t("breeds.noResults")}
          </h3>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {breeds.map((breed) => (
              <div
                key={breed.id}
                className="group bg-card border border-border hover:border-primary/40 rounded-3xl p-5 flex flex-col gap-4 shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_30px_rgba(201,109,46,0.06)] dark:hover:shadow-[0_12px_30px_rgba(234,168,94,0.08)] transition-all duration-300 cursor-pointer"
              >
                {/* Pet breed image */}
                <div className="relative w-full aspect-video bg-secondary rounded-2xl overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      breed.imageUrl &&
                      breed.imageUrl !== "null" &&
                      breed.imageUrl !== "undefined" &&
                      breed.imageUrl.trim() !== ""
                        ? breed.imageUrl
                        : breed.petType === "dog"
                        ? "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&auto=format&fit=crop"
                        : "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&auto=format&fit=crop"
                    }
                    alt={breed.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Badge for untranslated language */}
                  {!breed.isTranslated && locale === "vi" && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold bg-amber-500/90 text-white px-2 py-0.5 rounded-lg backdrop-blur-xs">
                      {t("breeds.untranslated")}
                    </span>
                  )}
                  <span className="absolute bottom-3 left-3 text-xs font-bold bg-black/60 text-white px-2.5 py-1 rounded-full backdrop-blur-xs">
                    {breed.petType === "dog" ? "🐶 Dog" : "🐱 Cat"}
                  </span>
                </div>

                {/* Title & Info */}
                <div className="flex flex-col flex-1 gap-2">
                  <h3 className="text-lg font-black tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
                    {breed.name}
                  </h3>
                  {breed.nameEn && breed.nameEn !== breed.name && (
                    <p className="text-xs text-muted/80 italic font-medium -mt-1">
                      {breed.nameEn}
                    </p>
                  )}
                  <p className="text-xs text-muted leading-relaxed font-light line-clamp-3">
                    {breed.description || "..."}
                  </p>
                </div>

                {/* Specs */}
                <div className="flex flex-col gap-1.5 pt-3 border-t border-border/60 text-[11px] font-medium text-foreground">
                  {breed.origin && (
                    <div className="flex justify-between">
                      <span className="text-muted font-normal">{t("breeds.origin")}:</span>
                      <span className="font-bold truncate max-w-[70%]">{breed.origin}</span>
                    </div>
                  )}
                  {breed.lifeSpan && (
                    <div className="flex justify-between">
                      <span className="text-muted font-normal">{t("breeds.lifeSpan")}:</span>
                      <span className="font-bold">{breed.lifeSpan}</span>
                    </div>
                  )}
                  {breed.weightKg && (
                    <div className="flex justify-between">
                      <span className="text-muted font-normal">{t("breeds.weight")}:</span>
                      <span className="font-bold">{breed.weightKg}</span>
                    </div>
                  )}
                  {breed.temperament && (
                    <div className="flex flex-col gap-1 mt-1 text-[10px] text-muted">
                      <span className="font-normal">{t("breeds.temperament")}:</span>
                      <span className="text-foreground leading-normal line-clamp-2 italic">
                        &ldquo;{breed.temperament}&rdquo;
                      </span>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>

          {/* Premium Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-6 border-t border-border/60 pt-6 mt-4">
              <Button
                variant="secondary"
                onClick={_onPrevPage}
                disabled={page === 1}
                className="rounded-xl px-4 py-2 text-xs font-bold active:scale-95 transition-transform"
              >
                ← {t("breeds.prevPage")}
              </Button>
              
              <span className="text-xs font-bold text-foreground min-w-[80px] text-center">
                {t("breeds.pageIndicator")
                  .replace("{page}", page.toString())
                  .replace("{totalPages}", totalPages.toString())}
              </span>

              <Button
                variant="secondary"
                onClick={_onNextPage}
                disabled={page === totalPages}
                className="rounded-xl px-4 py-2 text-xs font-bold active:scale-95 transition-transform"
              >
                {t("breeds.nextPage")} →
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
