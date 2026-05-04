package com.buffetease.buffet_ease.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.buffetease.buffet_ease.model.Package;

/**
 * PackageRepository — data access layer for the "packages" table.
 *
 * Extends JpaRepository<Package, Long> which provides all standard CRUD operations:
 *   - findAll()        → SELECT * FROM packages — used to list all packages on the packages page.
 *   - findById(id)     → SELECT WHERE id = ? — used when loading a single package.
 *   - existsById(id)   → SELECT COUNT(*) WHERE id = ? — used to validate a package exists.
 *   - save(pkg)        → INSERT or UPDATE a package row.
 *
 * No custom query methods are needed — all required queries are covered by JpaRepository.
 * @Repository registers this interface as a Spring bean for dependency injection.
 */
@Repository
public interface PackageRepository extends JpaRepository<Package, Long> {
    // No custom methods — the built-in JpaRepository methods cover all current use cases.
}
