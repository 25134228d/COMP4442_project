package com.comp4442.backend.buffetpkg;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BuffetPackageRepository extends JpaRepository<BuffetPackageEntity, String> {
    List<BuffetPackageEntity> findByIsActiveTrue();
}
