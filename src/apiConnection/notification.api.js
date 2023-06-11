import { toast } from 'react-toastify'

export function notify(message, sticky = false) {
	toast(<div>{message}</div>, {
		autoClose: sticky ? false : 4000,
	})
}

export function notifySuccess(message, sticky = false) {
	toast.success(<div>{message}</div>, {
		autoClose: sticky ? false : 4000,
	})
}

export function notifyInfo(message, sticky = false) {
	toast.info(<div>{message}</div>, {
		autoClose: sticky ? false : 4000,
	})
}

export function notifyWarning(message, sticky = false) {
	toast.warning(<div>{message}</div>, {
		autoClose: sticky ? false : 4000,
	})
}

export function notifyError(message, sticky = false) {
	toast.error(<div>{message}</div>, {
		autoClose: sticky ? false : 4000,
	})
}
