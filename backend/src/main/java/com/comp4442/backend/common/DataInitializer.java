package com.comp4442.backend.common;

import com.comp4442.backend.buffetpkg.BuffetPackageEntity;
import com.comp4442.backend.buffetpkg.BuffetPackageRepository;
import com.comp4442.backend.common.Enums.MealType;
import com.comp4442.backend.common.Enums.SessionStatus;
import com.comp4442.backend.session.DiningSessionEntity;
import com.comp4442.backend.session.DiningSessionRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seed(BuffetPackageRepository packageRepository, DiningSessionRepository sessionRepository) {
        return args -> {
            if (packageRepository.count() > 0) return;

            BuffetPackageEntity p1 = new BuffetPackageEntity();
            p1.setName("Ocean Bounty Seafood Night");
            p1.setDescription("A premium selection of seafood dishes.");
            p1.setPricePerPerson(new BigDecimal("85"));
            p1.setType(MealType.DINNER);
            p1.setImageUrl("https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&q=80&w=1000");
            p1.setActive(true);

            BuffetPackageEntity p2 = new BuffetPackageEntity();
            p2.setName("Artisanal Sunday Brunch");
            p2.setDescription("Handcrafted pastries, eggs, and brunch classics.");
            p2.setPricePerPerson(new BigDecimal("45"));
            p2.setType(MealType.BRUNCH);
            p2.setImageUrl("https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&q=80&w=1000");
            p2.setActive(true);

            BuffetPackageEntity p3 = new BuffetPackageEntity();
            p3.setName("Global Flavors Lunch");
            p3.setDescription("A rotating selection of international cuisine.");
            p3.setPricePerPerson(new BigDecimal("32"));
            p3.setType(MealType.LUNCH);
            p3.setImageUrl("https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&q=80&w=1000");
            p3.setActive(true);

            List<BuffetPackageEntity> packages = packageRepository.saveAll(List.of(p1, p2, p3));

            for (BuffetPackageEntity pkg : packages) {
                for (int i = 1; i <= 7; i++) {
                    DiningSessionEntity s = new DiningSessionEntity();
                    s.setBuffetPackage(pkg);
                    s.setSessionDate(LocalDate.now().plusDays(i));
                    if (pkg.getType() == MealType.DINNER) {
                        s.setStartTime(LocalTime.of(18, 0));
                        s.setEndTime(LocalTime.of(21, 0));
                    } else if (pkg.getType() == MealType.BRUNCH) {
                        s.setStartTime(LocalTime.of(10, 0));
                        s.setEndTime(LocalTime.of(14, 0));
                    } else {
                        s.setStartTime(LocalTime.of(12, 0));
                        s.setEndTime(LocalTime.of(15, 0));
                    }
                    s.setMaxCapacity(40);
                    s.setCurrentBooked(0);
                    s.setStatus(SessionStatus.OPEN);
                    sessionRepository.save(s);
                }
            }
        };
    }
}
