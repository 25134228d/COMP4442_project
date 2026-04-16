package com.buffetease.server.dto;

import com.buffetease.server.domain.UserProfileEntity;

public record LoginResponse(
                AuthUser user,
                UserProfileEntity profile) {
        public record AuthUser(
                        String uid,
                        String email,
                        String displayName) {
        }
}
