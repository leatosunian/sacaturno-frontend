export default interface AlertInterface {
    msg: string | undefined;
    error: boolean | undefined;
    alertType: 'OK_ALERT' | 'ERROR_ALERT'
}