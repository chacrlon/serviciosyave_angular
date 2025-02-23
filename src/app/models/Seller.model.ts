export interface Seller {
    id?: number; // Opcional, ya que se genera en el backend
    fullName: string;
    idNumber: string;
    gender: string;
    profession: string;
    yearsOfExperience: number;
    skillsDescription: string;
    profilePicture: string;
    galleryImages: string[];
    email: string;
    serviceName: string;
    certifications: string;
    extras: string;
  }