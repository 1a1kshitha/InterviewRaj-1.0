// ======================
// PAGE NAVIGATION
// ======================

function showPage(
    pageId,
    btn
) {

    document
        .querySelectorAll(
            ".page"
        )
        .forEach(page => {

            page.style.display =
                "none";
        });

    document
        .getElementById(
            pageId
        )
        .style.display =
        "block";

    document
        .querySelectorAll(
            ".nav-btn"
        )
        .forEach(button => {

            button.classList.remove(
                "active-btn"
            );
        });

    if (btn) {

        btn.classList.add(
            "active-btn"
        );
    }
    if (pageId === "interview-page") {

        startCamera();

    } else {

        stopCamera();

    }
}

// ======================
// LOAD SAVED DATA
// ======================

function loadSavedData() {

    loadScores();

    loadUser();
}

// ======================
// APP START
// ======================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadSavedData();

        const token =
            localStorage.getItem(
                "token"
            );

        if (token) {

            showPage(
                "dashboard-page"
            );

        } else {

            showPage(
                "login-page"
            );
        }
    });
if (pageId === "interview-page") {

    startCamera();

} else {

    stopCamera();
}