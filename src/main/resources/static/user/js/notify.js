(function () {
    if (typeof Notyf === 'undefined') {
        window.notify = {
            success: (msg) => console.log(msg),
            error: (msg) => console.error(msg),
            warning: (msg) => console.warn(msg),
            info: (msg) => console.info(msg)
        };
        return;
    }

    const notyf = new Notyf({
        duration: 3200,
        dismissible: true,
        ripple: true,
        position: { x: 'right', y: 'top' },
        types: [
            {
                type: 'success',
                background: '#2f9e6e',
                icon: { className: 'notyf__icon--success', tagName: 'i' }
            },
            {
                type: 'error',
                background: '#c70e1c',
                icon: { className: 'notyf__icon--error', tagName: 'i' }
            },
            {
                type: 'warning',
                background: '#d97706',
                icon: false
            },
            {
                type: 'info',
                background: '#495057',
                icon: false
            }
        ]
    });

    window.notify = {
        success(message) {
            notyf.success(String(message));
        },
        error(message) {
            notyf.error(String(message));
        },
        warning(message) {
            notyf.open({ type: 'warning', message: String(message) });
        },
        info(message) {
            notyf.open({ type: 'info', message: String(message) });
        }
    };
})();
