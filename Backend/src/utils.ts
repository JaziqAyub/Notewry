import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// Extend Request type to include `user` property
declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload & { user: { _id: string } }; // Make user optional
  }
}

function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
     res.sendStatus(401);
     return
  }

  jwt.verify(token, process.env.SECRET_KEY as string, (err, decoded) => {
    if (err) {
      return res.sendStatus(403);
    }

    req.user = decoded as JwtPayload & { user: any }; // ✅ Type assertion to avoid TypeScript error
    next();
  });
}

export { authenticateToken };
