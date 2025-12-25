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
  RU = 'russian',
  KZ = 'kazakh',
  UZ = 'uzbek',
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
  PENDING = 'pending',
  WAITING_FOR_MASTER = 'waiting_for_master',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED_BY_USER = 'cancelled_by_user',
  CANCELLED_BY_MASTER = 'cancelled_by_master',
}

export enum OrderOfferStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
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
  VIDEO = 'video',
  AUDIO = 'audio',
  FILE = 'file',
  SYSTEM = 'system',
  OFFER = 'offer',
  OFFER_RESPONSE = 'offer_response',
  LOCATION = 'location',
  PAYMENT = 'payment',
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
  NOT_FILLED = 'notfilled',
  FILLED = 'filled',
  VERIFIED = 'verified',
}
