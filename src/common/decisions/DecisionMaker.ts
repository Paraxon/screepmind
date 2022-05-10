import { Action } from "common/actions/Action";

export interface DecisionMaker<actor_t, return_t = void> {
	decide(actor: actor_t): Action<actor_t, return_t> | undefined;
}
