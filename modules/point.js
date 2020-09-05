class Point {
    X = 0;
    Y = 0;
    constructor(X, Y) {
        this.X = X;
        this.Y = Y;
    }

    Negate() {
        return this.Scale(-1);
    }

    Scale(scale, floor) {
        let x = this.X * scale;
        if (floor) {
            x = Math.floor(x);
        }
        let y = this.Y * scale;
        if (floor) {
            y = Math.floor(y);
        }
        return new Point(x, y);
    }

    Add(p) {
        return new Point(this.X + p.X, this.Y + p.Y);
    }

    Equals(p) {
        return this.X === p.X && this.Y === p.Y;
    }

    toString() {
        return "{ X: " + this.X + ", Y: " + this.Y + " }";
    }
}
Point.Zero = new Point(0, 0);

export {Point};