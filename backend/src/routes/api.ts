import { Router, Request, Response } from 'express';

import {CreateChallengeBody, CreateChallengeResponse} from './api-types.js'
import { challengeService } from '../index.js';

const router = Router();
export default router;


router.post(
    '/create-challenge',
    async (
        req: Request<{}, CreateChallengeResponse, CreateChallengeBody>,
        res: Response<CreateChallengeResponse> 
    ) => {
        
        const challengeId = await challengeService.createChallenge(
            req.body.hostColor,
            req.body.timeControl 
        )

        res.status(201).json({ challengeId })
    }
);

/*
router.post(
    '/accept-challenge/{challengUUID}',
    async (
        req: Request<{}, >,
        res: Response<> ) => {
        //ToDo
});
*/