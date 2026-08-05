package gustavo.company.utils;

import java.util.UUID;

import gustavo.company.entity.UserDomain;
import gustavo.company.exception.JWTException;
import jakarta.servlet.http.HttpServletRequest;

public interface JWTUtils {

    String generateUserToken(UserDomain user);

    String validateAndExtractUserId(String token);

    UUID getUserIdFromCookie(HttpServletRequest request) throws JWTException;
}