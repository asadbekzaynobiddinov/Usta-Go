import { Entity, Column } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { CardType } from 'src/common/enum';

@Entity()
export class Cards extends BaseEntity {
  @Column({ nullable: false })
  card_number: string;

  @Column({ nullable: false })
  card_holder_name: string;

  @Column({ nullable: false })
  expiration_date: string;

  @Column({ nullable: true })
  cvv: string;

  @Column({ nullable: false })
  cardToken: string;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'enum', enum: CardType, nullable: false })
  card_type: CardType;
}
