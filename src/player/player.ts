import { Color } from "../chess/types/color.js";

export abstract class Player {

    public constructor(
        public name: string,
        public color: Color,
        public isBot: boolean
    ) {

    }
}