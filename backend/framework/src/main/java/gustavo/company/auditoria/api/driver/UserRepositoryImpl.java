package gustavo.company.auditoria.api.driver;

import java.util.Optional;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Repository;

import gustavo.company.auditoria.api.adapter.mapper.UserMapper;
import gustavo.company.auditoria.api.driver.client.UserRepositoryOrm;
import gustavo.company.auditoria.api.entity.User;
import gustavo.company.entity.UserDomain;
import gustavo.company.exception.BadRequest;
import gustavo.company.exception.Conflict;
import gustavo.company.exception.InternalServerError;
import gustavo.company.exception.InvalidData;
import gustavo.company.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Repository
@Slf4j
@RequiredArgsConstructor
public class UserRepositoryImpl implements UserRepository {

    private final UserRepositoryOrm userRepositoryOrm;

    /**
     * Saves a new user in the database.
     *
     * @param user User to be saved
     * @return Saved user converted to UserDomain
     * @throws Conflict            if there is a data conflict (e.g., duplication)
     * @throws InvalidData         if the user data is invalid
     * @throws InternalServerError for unexpected internal errors
     */
    @Override
    public UserDomain save(final UserDomain user) {
        log.debug("Saving user: {}", user);
        try {
            final User userSaved = userRepositoryOrm.save(UserMapper.toEntityComplete(user));
            return UserMapper.toDomainBasic(userSaved);
        } catch (DataIntegrityViolationException e) {
            log.error("Conflict while saving user: {}", user, e);
            throw new Conflict("Conflict detected while saving user", e);
        } catch (IllegalArgumentException e) {
            log.error("Invalid data to save user: {}", user, e);
            throw new InvalidData("Invalid data provided for saving user", e);
        } catch (Exception e) {
            log.error("Internal error occurred while saving user: {}", user, e);
            throw new InternalServerError("Internal error occurred while saving user", e);
        }
    }

    /**
     * Finds a user by email.
     *
     * @param email Email of the user to be searched
     * @return Optional containing the user, if found
     * @throws BadRequest          if the email is invalid
     * @throws InternalServerError for unexpected internal errors
     */
    @Override
    public Optional<UserDomain> findByEmail(final String email) {
        log.debug("Searching for user by email: {}", email);
        try {
            final Optional<User> userOpt = userRepositoryOrm.findByEmail(email);
            return userOpt.map(UserMapper::toDomainBasic);
        } catch (IllegalArgumentException e) {
            log.error("Invalid email provided: {}", email, e);
            throw new BadRequest("Invalid email provided", e);
        } catch (Exception e) {
            log.error("Internal error occurred while searching for user by email: {}", email, e);
            throw new InternalServerError("Internal error occurred while finding user by email", e);
        }
    }

    /**
     * Finds a user by username.
     *
     * @param username Username of the user to be searched
     * @return Optional containing the user, if found
     * @throws BadRequest          if the username is invalid
     * @throws InternalServerError for unexpected internal errors
     */
    @Override
    public Optional<UserDomain> findByName(final String name) {
        log.debug("Searching for user by name: {}", name);
        try {
            final Optional<User> userOpt = userRepositoryOrm.findByName(name);
            return userOpt.map(UserMapper::toDomainBasic);
        } catch (IllegalArgumentException e) {
            log.error("Invalid name provided: {}", name, e);
            throw new BadRequest("Invalid name provided", e);
        } catch (Exception e) {
            log.error("Internal error occurred while searching for user by name: {}", name, e);
            throw new InternalServerError("Internal error occurred while finding user by name", e);
        }
    }

    /**
     * Finds a user by ID.
     *
     * @param userId UUID of the user to be searched
     * @return Optional containing the user, if found
     * @throws BadRequest          if the ID is invalid
     * @throws InternalServerError for unexpected internal errors
     */
    @Override
    public Optional<UserDomain> findById(final UUID userId) {
        log.debug("Searching for user by ID: {}", userId);
        try {
            final Optional<User> userOpt = userRepositoryOrm.findById(userId);
            return userOpt.map(UserMapper::toDomainBasic);
        } catch (IllegalArgumentException e) {
            log.error("Invalid ID provided: {}", userId, e);
            throw new BadRequest("Invalid user ID provided", e);
        } catch (Exception e) {
            log.error("Internal error occurred while searching for user by ID: {}", userId, e);
            throw new InternalServerError("Internal error occurred while finding user by ID", e);
        }
    }

}
