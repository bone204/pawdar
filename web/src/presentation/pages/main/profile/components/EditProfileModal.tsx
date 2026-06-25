import React, { useState, useEffect } from "react";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { Modal } from "@/presentation/components/ui/Modal";
import { TextField } from "@/presentation/components/ui/TextField";
import { Button } from "@/presentation/components/ui/Button";
import { useUpdateProfileMutation } from "@/infrastructure/rtk/api/user.api";
import { UserProfileDto } from "@/application/dto/user.dto";
import { useDispatch } from "react-redux";
import { updateUser } from "@/infrastructure/rtk/auth.slice";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfileDto;
  onSuccess: (msg: string) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (profile && isOpen) {
      setFullName(profile.fullName || "");
      setPhoneNumber(profile.phoneNumber || "");
      setAddress(profile.address || "");
      setBio(profile.bio || "");
    }
  }, [profile, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    try {
      const updated = await updateProfile({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        address: address.trim() || undefined,
        bio: bio.trim() || undefined,
      }).unwrap();

      dispatch(updateUser({
        fullName: updated.fullName,
        phoneNumber: updated.phoneNumber,
      }));

      onSuccess(t("profile.updateSuccess"));
      onClose();
    } catch (err) {
      console.error("Save profile error", err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("profile.editProfile")}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid md:grid-cols-2 gap-5">
          <TextField
            id="modal-fullName"
            label={t("profile.name")}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <TextField
            id="modal-phone"
            label={t("profile.phone")}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        <div>
          <TextField
            id="modal-address"
            label={t("profile.address")}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-foreground/80">{t("profile.bio")}</label>
          <textarea
            id="modal-bio-textarea"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full bg-secondary/30 border border-border rounded-xl p-3.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
            placeholder={t("profile.bioPlaceholder")}
          />
        </div>

        <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-border text-sm font-bold text-foreground hover:bg-secondary/40 transition-colors cursor-pointer"
          >
            {t("common.cancel")}
          </button>
          <Button
            id="modal-save-btn"
            variant="primary"
            type="submit"
            isLoading={isUpdating}
            className="px-6 py-2.5 rounded-xl text-sm"
          >
            {t("profile.saveChanges")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
