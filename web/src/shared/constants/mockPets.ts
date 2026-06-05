export interface MockPet {
  id: number;
  name: string;
  breed: string;
  timeAgo: string;
  distance: string;
  emoji: string;
  lat: number;
  lng: number;
}

const petNames = [
  "Bella", "Max", "Luna", "Charlie", "Lucy", "Cooper", "Bailey", "Daisy", 
  "Rocky", "Lola", "Jack", "Stella", "Toby", "Coco", "Milo", "Sophie", 
  "Leo", "Chloe", "Teddy", "Lily", "Simba", "Lucky", "Buster", "Oliver"
];

const dogBreeds = [
  "Poodle", "Husky", "Golden", "Shiba Inu", "Corgi", "Pug", "Phú Quốc", "Samoyed", "Alaska"
];

const catBreeds = [
  "Anh Lông Ngắn", "Ba Tư", "Maine Coon", "Xiêm", "Mướp", "Anh Lông Dài"
];

export const generateMockPets = (centerLat: number, centerLng: number, count: number = 40): MockPet[] => {
  const pets: MockPet[] = [];
  
  for (let i = 0; i < count; i++) {
    const isDog = Math.random() > 0.4;
    const name = petNames[Math.floor(Math.random() * petNames.length)];
    const breed = isDog 
      ? dogBreeds[Math.floor(Math.random() * dogBreeds.length)]
      : catBreeds[Math.floor(Math.random() * catBreeds.length)];
    const emoji = isDog
      ? (Math.random() > 0.6 ? "🐩" : (Math.random() > 0.5 ? "🐺" : "🐶"))
      : "🐱";
      
    // Random offset within a 3.5km radius
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.003 + Math.random() * 0.028; // between ~300m and ~3km
    const latOffset = Math.sin(angle) * radius;
    const lngOffset = Math.cos(angle) * radius;
    
    const lat = centerLat + latOffset;
    const lng = centerLng + lngOffset;
    
    // Distance calculation
    const distMeter = Math.round(radius * 111000);
    const distance = distMeter >= 1000 
      ? `Bán kính: ${(distMeter / 1000).toFixed(1)}km`
      : `Bán kính: ${distMeter}m`;
      
    const hours = Math.floor(Math.random() * 20) + 1;
    const timeAgo = hours > 12 
      ? `Lạc 1 ngày trước`
      : `Lạc ${hours} giờ trước`;

    pets.push({
      id: i + 1,
      name,
      breed: isDog ? `Chó ${breed}` : `Mèo ${breed}`,
      timeAgo,
      distance,
      emoji,
      lat,
      lng,
    });
  }
  
  return pets;
};
