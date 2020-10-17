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

    Add(x, y) {
        if (x instanceof Point && y === undefined) {
            let p = x;
            return this.Add(p.X, p.Y);
        } else {
            return new Point(this.X + x, this.Y + y);
        }
    }

    Equals(p) {
        return this.X === p.X && this.Y === p.Y;
    }

    RoundTo(v) {
        return new Point(
            Math.round(this.X / v) * v,
            Math.round(this.Y / v) * v
        );
    }

    DistanceTo(p) {
        return Math.sqrt(
            Math.pow(this.X - p.X, 2) + 
            Math.pow(this.Y - p.Y, 2));
    }

    toString() {
        return "{ X: " + this.X + ", Y: " + this.Y + " }";
    }
}
Point.Zero = new Point(0, 0);
Point.North = new Point(0, -1);
Point.South = new Point(0, 1);
Point.East = new Point(1, 0);
Point.West = new Point(-1, 0);

export {Point};