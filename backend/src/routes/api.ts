import { Router, Request, Response } from 'express';

import {CreateChallengeBody, CreateChallengeResponse, GetChallengeRequest, GetChallengeResponse} from './api-types.js'
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

router.get(
    '/challenges/:challengeId',
    async (
        req: Request<GetChallengeRequest, GetChallengeResponse, {}>,
        res: Response<GetChallengeResponse>
    ) => {
        
        const challenge = await challengeService.getChallengeById(req.params.challengeId);

        if (!challenge) {
            return res.status(404).json({ error: 'Challenge expired, does not exist, or has already been accepted' });
        }

        res.status(200).json(challenge);
    }
);