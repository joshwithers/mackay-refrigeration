---
title: Equipment hire agreement
slug: hire-contract
version: "2026-08-17"
description: Complete the hire schedule and confirm that you understand the Mackay Refrigeration hire conditions.
submitLabel: Submit hire agreement
confirmationTitle: Hire agreement received
confirmationMessage: Thanks — your hire agreement has been recorded. Mackay Refrigeration will contact you if anything else is needed before commencement.
sections:
  - title: Equipment being hired
    fields:
      - id: equipment
        type: checkbox
        label: Equipment
        required: true
        options:
          - label: Cold Room
            value: cold-room
          - label: Freezer Room
            value: freezer-room
          - label: Portable Air-Conditioner
            value: portable-air-conditioner
  - title: Hire details
    fields:
      - id: hire_date
        type: date
        label: Date of hire beginning
        required: true
      - id: hire_location
        type: textarea
        label: Where will the equipment be used?
        required: true
        placeholder: Site address, suburb and postcode
        rows: 3
  - title: Customer details
    fields:
      - id: hirer_name
        type: text
        label: Full name
        required: true
        autocomplete: name
      - id: hirer_company
        type: text
        label: Company name
        autocomplete: organization
      - id: hirer_email
        type: email
        label: Email
        required: true
        autocomplete: email
      - id: hirer_phone
        type: tel
        label: Phone
        required: true
        autocomplete: tel
      - id: drivers_licence
        type: text
        label: Driver's licence number
        required: true
        autocomplete: off
  - title: Terms acceptance
    description: Tick each statement to confirm your understanding before submitting.
    fields:
      - id: accept_return
        type: acceptance
        label: I understand that I must return the equipment clean and in good repair at my own expense.
        required: true
      - id: accept_loss
        type: acceptance
        label: I understand that I am responsible for loss or theft of the equipment.
        required: true
      - id: accept_use
        type: acceptance
        label: I understand the equipment must only be used safely and for its permitted purpose.
        required: true
      - id: accept_payment
        type: acceptance
        label: I understand that hire charges and agreed costs are payable under the hire conditions.
        required: true
      - id: acceptance_name
        type: text
        label: Type your full name to accept these terms
        required: true
        autocomplete: name
---

The full hire contract conditions are displayed before this form. The submitted version, acceptance values and timestamp are retained with the agreement.
