export class Piece {
    constructor(color, position) {
        this._state = {
            hasMoved: false,
            isCaptured: false,
            isPromoted: false
        };
        this._color = color;
        this._position = position;
    }
    isActive() {
        return !this._state.isCaptured && !this._state.isPromoted;
    }
    moveTo(position) {
        this.setPosition(position);
        this._state.hasMoved = true;
    }
    capture() {
        this._state.isCaptured = true;
    }
    get state() {
        return Object.assign({}, this._state);
    }
    setState(value) {
        this._state = value;
    }
    get position() {
        return Object.assign({}, this._position);
    }
    setPosition(value) {
        this._position = value;
    }
    get color() {
        return this._color;
    }
}
