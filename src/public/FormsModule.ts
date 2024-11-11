/*
  MIT License

  Copyright © 2024 Alex Høffner

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software
  and associated documentation files (the “Software”), to deal in the Software without
  restriction, including without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or
  substantial portions of the Software.

  THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
  BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const version = "3.0.0";


import { FormsModule as FormsModuleCore} from 'futureforms';
import { BusinessEvents } from '../events/BusinessEvents.js';


export class FormsModule extends FormsModuleCore
{
   /**
    * @returns The version of this library
    */
   public static version() : string
   {
      return(version);
   }

   /**
    * @returns The version of the core library
    */
	public static coreVersion() : string
   {
      return(FormsModuleCore.version());
   }


   /**
    * @returns The browser language
    */
	public static language() : string
	{
		return(FormsModuleCore.Language);
	}


   /**
    * Initialize the application
    */
	public static async initialize() : Promise<void>
	{
		BusinessEvents.initialize();
	}
}