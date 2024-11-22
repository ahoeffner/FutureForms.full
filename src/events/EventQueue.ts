type Resolve<T> = (arg?:T) => T;

export class EventQueue
{
	private queue$:Resolve<any>[] = [];


	public async test()
	{
		let tq:EventQueue = new EventQueue();

		tq.getSlot(1);
		tq.getSlot(2);
		tq.priority(0);
	}


	public priority<T>(payload?:T) : Promise<T>
	{
		let slot:Promise<T> = new Promise((resolve) =>
		{
			this.queue$.unshift(resolve);
			setTimeout(() => {this.check(resolve,payload)},100);
		});

		return(slot);
	}


	public getSlot<T>(payload?:T) : Promise<T>
	{
		let slot:Promise<T> = new Promise((resolve) =>
		{
			this.queue$.push(resolve);
			setTimeout(() => {this.check(resolve,payload)},100);
		});

		return(slot);
	}


	private check(resolve:Resolve<any>, payload:any) : void
	{
		if (this.queue$[0] == resolve)
		{
			// pop and test again
			let check:Resolve<any> = this.queue$.shift();

			if (check == resolve)
			{
				console.log("resolve "+payload)
				resolve(payload);
				return;
			}

			// Put it back
			else this.queue$.unshift(check);
		}

		// Try again later
		setTimeout(() => {this.check(resolve,payload)},1000);
	}
}