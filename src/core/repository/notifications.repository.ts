import { Repository } from 'typeorm';
import { Notifications } from '../entity/notifications.entity';

export type NotificationsRepository = Repository<Notifications>;
