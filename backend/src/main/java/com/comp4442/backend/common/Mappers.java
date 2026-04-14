package com.comp4442.backend.common;

import com.comp4442.backend.buffetpkg.BuffetPackageEntity;
import com.comp4442.backend.common.ApiModels.BuffetPackageDto;
import com.comp4442.backend.common.ApiModels.DiningSessionDto;
import com.comp4442.backend.common.ApiModels.ReservationDto;
import com.comp4442.backend.common.ApiModels.UserProfileDto;
import com.comp4442.backend.reservation.ReservationEntity;
import com.comp4442.backend.session.DiningSessionEntity;
import com.comp4442.backend.user.UserEntity;

public class Mappers {
    public static UserProfileDto toUserProfile(UserEntity u) {
        return new UserProfileDto(u.getId(), u.getName(), u.getEmail(), u.getRole().name(), u.getCreatedAt().toString());
    }

    public static BuffetPackageDto toPackageDto(BuffetPackageEntity p) {
        return new BuffetPackageDto(p.getId(), p.getName(), p.getDescription(), p.getPricePerPerson(), p.getType(), p.getImageUrl(), p.isActive());
    }

    public static DiningSessionDto toSessionDto(DiningSessionEntity s) {
        return new DiningSessionDto(
                s.getId(),
                s.getBuffetPackage().getId(),
                s.getSessionDate().toString(),
                s.getStartTime().toString(),
                s.getEndTime().toString(),
                s.getMaxCapacity(),
                s.getCurrentBooked(),
                s.getStatus());
    }

    public static ReservationDto toReservationDto(ReservationEntity r) {
        return new ReservationDto(
                r.getId(),
                r.getUser().getId(),
                r.getSession().getId(),
                r.getGuestCount(),
                r.getSpecialRequest(),
                r.getStatus(),
                r.getCreatedAt().toString(),
                r.getUpdatedAt().toString());
    }
}
