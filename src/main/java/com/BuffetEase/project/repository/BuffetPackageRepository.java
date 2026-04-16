package com.BuffetEase.project.repository;

import com.BuffetEase.project.entity.BuffetPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BuffetPackageRepository extends JpaRepository<BuffetPackage, String> {
    List<BuffetPackage> findByActive(boolean active);
}