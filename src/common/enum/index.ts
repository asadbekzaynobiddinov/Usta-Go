export enum RoleAdmin {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
}

export enum RoleUser {
  USER = 'user',
  MASTER = 'master',
}

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

export enum CardType {
  VISA = 'visa',
  MASTERCARD = 'mastercard',
}

export enum UserLang {
  RU = 'ru',
  KZ = 'kaz',
  UZ = 'uz',
}

export enum MasterGender {
  FEMALE = 'female',
  MALE = 'male',
}

export enum MasterStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

export enum PayoutAccountsEnum {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

export enum TargetRole {
  USER = 'user',
  MASTER = 'master',
  ADMIN = 'admin',
}

export enum OrderStatus {
  ACTIVE = 'active',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export enum OrderOfferStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export enum ChatParticipantRole {
  USER = 'USER',
  MASTER = 'MASTER',
  SYSTEM = 'SYSTEM',
  SUPPORT = 'SUPPORT',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  OFFER = 'offer',
  OFFER_RESPONSE = 'offer_response',
  LOCATION = 'location',
}

export enum FileType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  ARCHIVE = 'archive',
  LOCATION = 'location',
  OTHER = 'other',
}

export enum PaymentProvider {
  VISA = 'visa',
  MASTERCARD = 'mastercard',
  PAYME = 'payme',
  CLICK = 'click',
}

export enum UserAccountStatus {
  VERIFIED = 'verified',
  SUSPENDED = 'suspended',
}
