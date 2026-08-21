# Operating Loop Redesign Plan

## Goal

Replace the old four card operating row with a continuous autonomous mission
loop that preserves Dock, includes battery swap, shows GPS denied navigation,
and makes human oversight visibly branch from escalation.

## Implemented structure

- Dock
- Dispatch
- Patrol
- Detect
- Escalate
- Return
- Swap
- return connector to Dock
- GPS denied navigation resilience rail spanning the flight stages
- Human oversight branch from Escalate to the concept interface

## Copy decision

The recovery stage uses the single label `Swap`, as requested. Supporting copy
remains `Rapid battery recovery prepares the next flight.` so the stage does not
claim that the battery swap is automated. The published Sentrivion brochure
supports rapid battery swap and recharge, while the active page makes no claim
about the swap mechanism.

## Responsive treatment

Desktop uses a horizontal connected route with seven stages. Mobile uses a
vertical route with the same sequence, followed by the navigation resilience
rail and the return connector. The section is intentionally not forced into a
single viewport because the operating concept has more stages than the problem
section and must remain legible.
