/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Application from './api/app.service';
import { DataSource } from 'typeorm';
import { RoleAdmin } from './common/enum';
import { Admin } from './core';
import { config } from 'src/config';
import * as bcrypt from 'bcrypt';

void (async () => {
  const dataSource = new DataSource({
    type: 'postgres',
    url: config.DB_URL,
    entities: [Admin],
    synchronize: true,
  });

  try {
    console.log(config.SUPER_ADMIN_EMAIL, config.SUPER_ADMIN_PASSWORD);
    await dataSource.initialize();
    console.log('Database connection established.');

    const adminRepository = dataSource.getRepository(Admin);

    const hashedPassword = await bcrypt.hash(config.SUPER_ADMIN_PASSWORD, 10);

    console.log(hashedPassword);

    const superAdminExists = await adminRepository.findOneBy({
      email: config.SUPER_ADMIN_EMAIL,
    });
    if (!superAdminExists) {
      const superAdmin = adminRepository.create({
        email: config.SUPER_ADMIN_EMAIL,
        password: hashedPassword,
        role: RoleAdmin.SUPERADMIN,
      });
      await adminRepository.save(superAdmin);
      console.log('SuperAdmin created.');
    } else {
      console.log('SuperAdmin already exists.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await dataSource.destroy();
    console.log('Database connection closed.');
  }
})();

void Application.main();
