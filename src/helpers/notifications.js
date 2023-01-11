import toastr from "toastr";

toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": true,
    "progressBar": true,
    "positionClass": "toast-top-center",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "2400",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}

export function showInfo(msg, header) {
    toastr.info(msg, header)
}

export function showSuccess(msg, header) {
    toastr.success(msg, header)
}

export function showWarning(msg, header) {
    toastr.warning(msg, header)
}

export function showError(msg, header) {
    toastr.error(msg, header)
}
