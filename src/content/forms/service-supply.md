---
title: Service supply form
slug: service-supply
version: "2026-08-17"
description: Provide the site, contact and service information Mackay Refrigeration needs to get started.
submitLabel: Send service details
confirmationTitle: Service details received
confirmationMessage: Thanks — Mackay Refrigeration has received these service details and will be in touch about the next step.
sections:
  - title: Customer details
    fields:
      - id: full_name
        type: text
        label: Full name
        required: true
        autocomplete: name
      - id: company
        type: text
        label: Company or trading name
        autocomplete: organization
      - id: email
        type: email
        label: Email
        required: true
        autocomplete: email
      - id: phone
        type: tel
        label: Phone
        required: true
        autocomplete: tel
        inputMode: tel
  - title: Service site
    fields:
      - id: site_address
        type: textarea
        label: Service address
        required: true
        placeholder: Street address, suburb and postcode
        autocomplete: street-address
        rows: 3
      - id: site_contact
        type: text
        label: On-site contact
        placeholder: Name and best phone number
      - id: access_notes
        type: textarea
        label: Access, safety or site notes
        placeholder: Access hours, parking, keys, inductions or other details…
        rows: 4
  - title: Work required
    fields:
      - id: service_type
        type: select
        label: Service type
        required: true
        options:
          - label: Breakdown or emergency repair
            value: emergency
          - label: Preventative maintenance
            value: maintenance
          - label: New installation or build
            value: installation
          - label: Inspection or quote
            value: inspection
          - label: Other
            value: other
      - id: equipment_details
        type: textarea
        label: Equipment and issue details
        required: true
        placeholder: Make, model, approximate age, symptoms, temperature or other useful information…
        rows: 6
      - id: requested_date
        type: date
        label: Preferred service date
      - id: urgent
        type: radio
        label: Is this urgent?
        options:
          - label: Yes — the business or stock is at risk
            value: yes
          - label: No — a standard appointment is fine
            value: no
---

Please provide as much detail as you can. A Mackay Refrigeration staff member will confirm availability and any information still needed before work begins.
