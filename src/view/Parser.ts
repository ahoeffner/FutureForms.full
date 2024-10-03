/*
  MIT License

  Copyright © 2023 Alex Høffner

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

import { Tag } from './tags/Tag.js';
import { Form } from '../public/Form.js';
import { Foreach } from './tags/Foreach.js';


export class Parser
{
   public get customtags() : Map<string,Tag>
   {
      return(new Map());
   }


   public get customattrs() : Map<string,Tag>
   {
      let map:Map<string,Tag> = new Map<string,Tag>();
      map.set("foreach",new Foreach());
      return(map);
   }


   public async parse(form:Form, page:HTMLElement) : Promise<void>
   {
      if (page == null)
			return;

		if (!page.childNodes)
			return;

      let nodes:Node[] = [];
		page.childNodes.forEach((node) => {nodes.push(node)});

      for (let i = 0; i < nodes.length; i++)
      {
         if (nodes[i] instanceof HTMLElement)
         {
            let tag:Tag = null;
            let replace:HTMLElement|HTMLElement[] = null;
            let element:HTMLElement = nodes[i] as HTMLElement;

            tag = this.customtags.get(element.tagName.toLowerCase());

            if (tag != null)
            {
               replace = tag.replace(form,element);
               this.replace(element,replace);
            }

            let attrs:string[] = element.getAttributeNames();

            for (let i = 0; i < attrs.length; i++)
            {
               let attr:string = attrs[i];
               tag = this.customattrs.get(attr.toLowerCase());

               if (tag != null)
               {
                  replace = tag.replace(form,element,attr);
                  this.replace(element,replace);
                  break;
               }
            }

            if (!tag)
               this.parse(form,nodes[i] as HTMLElement);
         }
      }
   }


   private replace(element:HTMLElement, replace:HTMLElement|HTMLElement[]) : void
   {
      if (!replace)
         return;

      if (!Array.isArray(replace))
      {
         element.replaceWith(replace);
         return;
      }

      let next:HTMLElement = element;
      let prev:HTMLElement = element;

      for (let i = 0; i < replace.length; i++)
      {
         next.after(replace[i]);
         next = replace[i];
      }

      prev.remove();
   }
}