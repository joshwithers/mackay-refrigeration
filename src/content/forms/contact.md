---
title: Contact enquiry
slug: contact
version: "2026-08-17"
description: Tell Mackay Refrigeration what you need help with and we will get back to you.
submitLabel: Send enquiry
confirmationTitle: Enquiry received
confirmationMessage: Thanks — your enquiry is with the Mackay Refrigeration team. We will be in touch as soon as we can.
sections:
  - title: Your details
    fields:
      - id: name
        type: text
        label: Name
        required: true
        placeholder: Jane Smith
        autocomplete: name
      - id: company
        type: text
        label: Company
        placeholder: Venue or business name
        autocomplete: organization
      - id: phone
        type: tel
        label: Phone
        required: true
        placeholder: 07 xxxx xxxx
        autocomplete: tel
        inputMode: tel
      - id: email
        type: email
        label: Email
        placeholder: you@example.com
        autocomplete: email
  - title: What do you need?
    fields:
      - id: service
        type: select
        label: Service required
        options:
          - label: Cold Room Build
            value: cold-room
          - label: Freezer Room Build
            value: freezer-room
          - label: Commercial Refrigeration
            value: commercial-refrigeration
          - label: Air Conditioning
            value: air-conditioning
          - label: Beer & Post Mix Systems
            value: beer-post-mix
          - label: Maintenance / Servicing Contract
            value: maintenance
          - label: Emergency Repair
            value: emergency
          - label: Other
            value: other
      - id: message
        type: textarea
        label: Tell us about your project
        placeholder: Brief description — size, location, timeline, and anything else we should know…
        rows: 6
---

The Mackay Refrigeration team uses these details to understand your enquiry and contact you about the next step.
