package com.buffetease.server.repository;

import com.buffetease.server.domain.BuffetPackageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BuffetPackageRepository extends JpaRepository<BuffetPackageEntity, String> {
    List<BuffetPackageEntity> findByIsActiveTrue();
}
