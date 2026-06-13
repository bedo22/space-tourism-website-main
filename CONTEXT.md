# Context

Glossary of domain terms used in the Space Tourism website.

The website presents three categories of information, each with multiple instances selected by the user via tabs.

## Crew
A person who operates a spacecraft. Each Crew member has:

- A **name**
- An **image** (WebP + PNG)
- A **role** (see [Crew Role](#crew-role))
- A **bio**

## Crew Role
The position a Crew member holds on a mission. The four roles in the system are:

- Commander
- Mission Specialist
- Pilot
- Flight Engineer

A Crew member has exactly one Crew Role.

## Destination
A place the user can travel to. Each Destination has:

- A **name**
- An **image** (WebP + PNG)
- A **description**
- A **distance** from Earth
- A **travel time** estimate

## Distance
The distance from Earth to a [Destination](#destination), expressed in kilometres. Values are human-formatted strings, not numbers — e.g. `"384,400 km"`, `"225 mil. km"`, `"1.6 bil. km"`.

## Travel time
The estimated time to reach a [Destination](#destination). Values are human-formatted strings, not durations — e.g. `"3 days"`, `"9 months"`, `"3 years"`, `"7 years"`.

## Technology
A vehicle or facility used in space travel. Each Technology has:

- A **name**
- An **image**, in two variants:
  - **portrait** (used on desktop, taller than wide)
  - **landscape** (used on mobile/tablet, wider than tall)
- A **description**

The three Technologies in the system are:

- Launch vehicle
- Spaceport
- Space capsule

## Tab
A view switcher. On Destination, Crew, and Technology pages, the user picks one of N [Items](#item) in a category by activating a Tab.

The Tab UI has three distinct parts:

- **Tabstrip** — the horizontal row of Tab controls. One per page. Has the ARIA role `tablist`.
- **Tab** — a single control in the Tabstrip. The user activates it to make its [Tab panel](#tab-panel) visible. Only one Tab is active at a time; the others are inactive. Has the ARIA role `tab`.
- **Tab panel** — the content area that displays the active [Item](#item)'s data (name, description, image, and any meta). The other Items' content is hidden. Has the ARIA role `tabpanel`.

The visible design of the Tabstrip varies per page (e.g. Destination uses dot tabs; Technology uses numbered pills) but the three-part structure is the same on all three pages.

## Item
One of the N entries in a category, displayed in the [Tab panel](#tab-panel) when its [Tab](#tab) is active.

- On the Destination page, an Item is a [Destination](#destination).
- On the Crew page, an Item is a [Crew](#crew) member.
- On the Technology page, an Item is a [Technology](#technology).

The first Item in each category is the default — used when the page is loaded with no valid URL hash.
