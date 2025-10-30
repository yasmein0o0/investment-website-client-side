export const formValidation = ({ name, email, password, c_password }) => {
    const errors = {}

    // Name validation
    if (!name || name.trim().length < 3) {
        errors.name = "Name must be at least 3 characters."
    }

    // Email validation
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        errors.email = "Please enter a valid email address.";
    }

    // Password validation
    if (!password) {
        errors.password = "Password is required.";
    } else {
        if (password.trim().length < 8) {
            errors.password = "Password must be at least 8 characters.";
        } else {
            const hasUpperCase = /[A-Z]/.test(password);
            const hasLowerCase = /[a-z]/.test(password);
            const hasNumber = /[0-9]/.test(password);
            const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

            let missingRequirements = [];
            if (!hasUpperCase) missingRequirements.push("an uppercase letter");
            if (!hasLowerCase) missingRequirements.push("a lowercase letter");
            if (!hasNumber) missingRequirements.push("a number");
            if (!hasSpecialChar) missingRequirements.push("a special character");

            if (missingRequirements.length > 0) {
                errors.password = `Password must contain at least ${missingRequirements.join(", ")}.`;
            }
        }
    }

    // Confirm password validation
    if (password !== c_password) {
        errors.c_password = "Passwords do not match.";
    }

    return errors;
}