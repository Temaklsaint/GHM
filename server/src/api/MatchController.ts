import * as bodyParser from 'body-parser'

import { Request, Response, Router } from 'express'

import {
  createMatch,
  fetchMatches,
  getMatch,
  deleteMatch,
  updateMatch,
  getActiveMatch,
  toggleMatchToLive,
  liveMatchCore
} from '../core/MatchCore'

const router = Router()

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

router.get('/active', async (req: Request, res: Response) => {
  try {
    const match = await getActiveMatch()
    return res.status(200).send(match)
  }
  catch (e) {
    if (e === null) {
      return res
        .status(200)
        .send(null)
    }
    else {
      return res
        .status(500)
        .send(e)
    }
  }
})

router.post('/live/:id', async (req: Request, res: Response) => {
  try {
    const updatedMatch = await toggleMatchToLive(req.params.id)
    const activeMatch = await getMatch(updatedMatch._id)
    return res.status(200).send(activeMatch)
  }
  catch (e) {
    return res
      .status(500)
      .send(e)
  }
})

router.get('/overlay', async (req: Request, res: Response) => {
  try {
    const active = await getActiveMatch()
    const players = [
      ...active.teamA.players,
      ...active.teamB.players
    ]

    let playerObj = { }
    players.map(p => {
      playerObj[p.steam64ID] = p
    })

    const refactored = {
      teamA: liveMatchCore.formatTeam(active.teamA, 'CT'),
      teamB: liveMatchCore.formatTeam(active.teamB, 'T'),
      players: {
        ...playerObj
      }
    }

    return res.status(200).send(refactored)
  }
  catch (e) {
    return res.status(404).send(e)
  }
})

router.get('/live', (req: Request, res: Response) => {
  liveMatchCore.dispatchActive()
  return res.sendStatus(200)
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const { teamA, teamB } = req.body
    const newMatch = await createMatch({ teamA, teamB })
    return res.status(200).send(newMatch)
  }
  catch (e) {
    return res
      .status(500)
      .send(e)
  }
})

router.get('/', async (req: Request, res: Response) => {
  try {
    const matches = await fetchMatches()
    return res.status(200).send(matches)
  }
  catch (e) {
    return res
      .status(500)
      .send(e)
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const match = await getMatch(req.params.id)
    return res.status(200).send(match)
  }
  catch (e) {
    return res
      .status(500)
      .send(e)
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const message = await deleteMatch(req.params.id)
    return res.status(200).send(message)
  }
  catch (e) {
    return res
      .status(500)
      .send(e)
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { teamA, teamB } = req.body
    const message = await updateMatch(req.params.id, { teamA, teamB })
    return res.status(200).send(message)
  }
  catch (e) {
    return res
      .status(500)
      .send(e)
  }
})

export default router
