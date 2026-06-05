export interface BreedOption {
  value: string;
  label: string;
}

export const DOG_BREEDS: BreedOption[] = [
  { value: "poodle", label: "Poodle 🐩" },
  { value: "husky", label: "Husky 🐕" },
  { value: "golden", label: "Golden Retriever 🦮" },
  { value: "shiba", label: "Shiba Inu 🦊" },
  { value: "corgi", label: "Corgi 🦊" },
  { value: "chihuahua", label: "Chihuahua 🐶" },
  { value: "pug", label: "Pug 🐕" },
  { value: "pomeranian", label: "Pomeranian 🐕" },
  { value: "beagle", label: "Beagle 🐶" },
];

export const CAT_BREEDS: BreedOption[] = [
  { value: "british_shorthair", label: "British Shorthair 🐱" },
  { value: "persian", label: "Persian 🐈" },
  { value: "siamese", label: "Siamese 🐱" },
  { value: "maine_coon", label: "Maine Coon 🐈" },
  { value: "ragdoll", label: "Ragdoll 🐈" },
  { value: "sphynx", label: "Sphynx 🐈" },
  { value: "munchkin", label: "Munchkin 🐱" },
  { value: "scottish_fold", label: "Scottish Fold 🐈" },
];
