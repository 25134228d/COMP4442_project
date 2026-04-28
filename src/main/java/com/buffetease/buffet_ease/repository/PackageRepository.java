package com.buffetease.buffet_ease.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.buffetease.buffet_ease.model.Package;

@Repository
public interface PackageRepository extends JpaRepository<Package, Long> {
}
