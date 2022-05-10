import { Action } from "common/actions/action";

export interface DecisionMaker<actor_t, return_t = void> {
	decide(actor: actor_t): Action<actor_t, return_t> | undefined;
}
