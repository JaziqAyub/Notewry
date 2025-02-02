import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// Extend Request type to include `user` property
declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload;  // Make user optional
  }
}

function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.SECRET_KEY as string, (err, decoded) => {
    if (err) {
      return res.sendStatus(403);
    }

    req.user = decoded as JwtPayload; // ✅ Type assertion to avoid TypeScript error
    next();
  });
}

export { authenticateToken };
