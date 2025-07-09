export class SoundManager {
    constructor() {
        this._isMuted = false;
        this._userHasInteracted = false;
    }
    playMoveSound() {
        if (!this._isMuted && this._userHasInteracted) {
            const moveSound = new Audio("sounds/move.mp3");
            moveSound.play();
        }
    }
    playCaptureSound() {
        if (!this._isMuted && this._userHasInteracted) {
            const captureSound = new Audio("sounds/capture.mp3");
            captureSound.play();
        }
    }
    playGenericNotifySound() {
        if (!this._isMuted && this._userHasInteracted) {
            const genericNotifySound = new Audio("sounds/genericnotify.mp3");
            genericNotifySound.play();
        }
    }
    get isMuted() {
        return this._isMuted;
    }
    set isMuted(value) {
        this._isMuted = value;
    }
    get userHasInteracted() {
        return this._userHasInteracted;
    }
    set userHasInteracted(value) {
        this._userHasInteracted = value;
    }
}
