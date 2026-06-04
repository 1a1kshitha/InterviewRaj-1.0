// ======================
// SIGNUP
// ======================

async function signup() {

    const email =
        document.getElementById(
            "email"
        ).value.trim();

    const password =
        document.getElementById(
            "password"
        ).value.trim();

    if (!email || !password) {

        alert(
            "Enter email and password"
        );

        return;
    }

    try {

        const response =
            await fetch(
                "http://localhost:5000/signup",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                });

        const data =
            await response.json();

        alert(data.message);

    } catch (err) {

        console.log(err);

        alert(
            "Signup failed"
        );
    }
}

// ======================
// LOGIN
// ======================

async function login() {

    const email =
        document.getElementById(
            "email"
        ).value.trim();

    const password =
        document.getElementById(
            "password"
        ).value.trim();

    if (!email || !password) {

        alert(
            "Please enter email and password"
        );

        return;
    }

    try {

        const response =
            await fetch(
                "http://localhost:5000/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                });

        const data =
            await response.json();

        if (data.token) {

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "userEmail",
                email
            );

            document.getElementById(
                "username"
            ).innerText =
                email.split("@")[0];

            showPage(
                "dashboard-page"
            );

        } else {

            alert(
                data.message
            );
        }

    } catch (err) {

        console.log(err);

        alert(
            "Server Error"
        );
    }
}

// ======================
// LOGOUT
// ======================

function logout() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "userEmail"
    );

    showPage(
        "login-page"
    );
}