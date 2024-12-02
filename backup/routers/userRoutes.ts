import express from 'express';

class UserRoutes {
    private app: express.Application;
    private passport: any;
    private isLoggedIn: (req: any, res: any, next: any) => any;

    constructor(app: express.Application, passport: any, isLoggedIn: (req: any, res: any, next: any) => any) {
        this.app = app;
        this.passport = passport;
        this.isLoggedIn = isLoggedIn;
        this.initRoutes();
    }

    initRoutes(): void{
        const passport: any = this.passport;
        
        // POST api/sessions
        this.app.post('/api/sessions', function (req: any, res: any, next: any) {
            passport.authenticate('local', (err: any, user: any, info: any) => {
                if (err) {
                    return next(err);
                }

                if (!user) {
                    return res.status(401).json(info);
                }
                // success, perform the login
                req.login(user, (err: any) => {
                    if (err) {
                        return next(err);
                    }

                    return res.json(req.user);
                });
            })(req, res, next);
        });

        // DELETE /sessions/current 
        this.app.delete('/api/sessions/current', this.isLoggedIn, (req: any, res: any) => {
            req.logout(() => { res.end(); });
        });

        // GET /sessions/current
        this.app.get('/api/sessions/current', (req: any, res: any) => {
            if (req.isAuthenticated()) {
                res.status(200).json(req.user);
            }
            else {
                res.status(401).json({ error: 'Unauthenticated user!' });
            }
        });
    }
}

export{UserRoutes};