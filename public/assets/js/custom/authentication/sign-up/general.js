// Ecmascript 6
"use strict";
const KTSignupGeneral = (() => {
    let form,
        submitButton,
        validator;

    const init = () => {

        form = document.querySelector("#kt_sign_up_form");
        submitButton = document.querySelector("#kt_sign_up_submit");

        const formActionValid = url => {
            try {
                new URL(url);
                return true;
            } catch (error) {
                return false;
            }
        };



        const formValidationOptions = {
            fields: {
                "name": {validators: {notEmpty: {message: "Nombre de la familia es necesario"}}},
                "phone": {validators: {notEmpty: {message: "El teléfono es requerido"}}},
                "lote": {validators: {notEmpty: {message: "El número de lote es requerdio"}}},
            },
            plugins: {
                trigger: new FormValidation.plugins.Trigger({event: {password: false}}),
                bootstrap: new FormValidation.plugins.Bootstrap5({
                    rowSelector: ".fv-row",
                    eleInvalidClass: "",
                    eleValidClass: ""
                })
            },
        };

        const formAction = submitButton.closest("form").getAttribute("action");
        validator = FormValidation.formValidation(form, formValidationOptions);

        submitButton.addEventListener("click", async (event) => {
            event.preventDefault();

            const validationStatus = await validator.validate();

            submitButton.setAttribute("data-kt-indicator", "on");
            submitButton.disabled = true;


            if (validationStatus === "Valid") {
                formActionValid(formAction)
                    ? await postForm(formAction)
                    : await processLocalSubmission();
            } else {
                displayError();
            }

            submitButton.removeAttribute("data-kt-indicator");
            submitButton.disabled = false;
        });
    };

    const postForm = async (formAction) => {
        try {
            const response = await axios.post(formAction, new FormData(form));

            if (response) {
                const redirectUrl = form.getAttribute("data-kt-redirect-url");

                if (redirectUrl) {
                    location.href = redirectUrl;
                }
            } else {
                displayError();
            }
        } catch (error) {
            displayError();
        }
    };

    const processLocalSubmission = async () => {

        const name = document.getElementById('name');
        const phone = document.getElementById('phone');
        const lote = document.getElementById('lote');

        fetch(window.Laravel.submitEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': window.Laravel.csrfToken
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                name: name.value,
                phone: phone.value,
                lote: lote.value,
            })
        })
            .then(response => response.json())
            .then(data => {

                console.log('data:', data)
                // Swal.fire({
                //     text: "You have successfully reset your password!",
                //     icon: "success",
                //     buttonsStyling: false,
                //     confirmButtonText: "Ok, got it!",
                //     customClass: {confirmButton: "btn btn-primary"},
                // }).then(function (result) {
                //     if (result.isConfirmed) {
                //         form.reset();
                //         const redirectUrl = form.getAttribute("data-kt-redirect-url");
                //
                //         if (redirectUrl) {
                //             location.href = redirectUrl;
                //         }
                //     }
                // });
            })
            .catch((error) => {
                document.getElementById("spinner").style.display = "none";
                console.error('Error:', error);
            });

    };

    const displayError = () => {
        Swal.fire({
            text: "Lo sentimos, parece que se han detectado algunos errores. Inténtalo de nuevo",
            icon: "error",
            buttonsStyling: false,
            confirmButtonText: "Ok, got it!",
            customClass: {confirmButton: "btn btn-primary"},
        });
    };

    return {
        init,
    };

})();

KTUtil.onDOMContentLoaded(function () {
    KTSignupGeneral.init();
});
