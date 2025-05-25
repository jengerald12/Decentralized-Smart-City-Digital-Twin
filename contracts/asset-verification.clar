;; Asset Verification Contract
;; Validates and manages city infrastructure assets

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-asset-not-found (err u101))
(define-constant err-asset-already-exists (err u102))

;; Asset data structure
(define-map assets
  { asset-id: uint }
  {
    asset-type: (string-ascii 50),
    location: (string-ascii 100),
    status: (string-ascii 20),
    last-verified: uint,
    verified-by: principal,
    metadata: (string-ascii 500)
  }
)

(define-data-var next-asset-id uint u1)

;; Register a new asset
(define-public (register-asset (asset-type (string-ascii 50))
                              (location (string-ascii 100))
                              (metadata (string-ascii 500)))
  (let ((asset-id (var-get next-asset-id)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set assets
      { asset-id: asset-id }
      {
        asset-type: asset-type,
        location: location,
        status: "active",
        last-verified: block-height,
        verified-by: tx-sender,
        metadata: metadata
      }
    )
    (var-set next-asset-id (+ asset-id u1))
    (ok asset-id)
  )
)

;; Verify an existing asset
(define-public (verify-asset (asset-id uint))
  (let ((asset (unwrap! (map-get? assets { asset-id: asset-id }) err-asset-not-found)))
    (map-set assets
      { asset-id: asset-id }
      (merge asset {
        last-verified: block-height,
        verified-by: tx-sender,
        status: "verified"
      })
    )
    (ok true)
  )
)

;; Get asset information
(define-read-only (get-asset (asset-id uint))
  (map-get? assets { asset-id: asset-id })
)

;; Update asset status
(define-public (update-asset-status (asset-id uint) (new-status (string-ascii 20)))
  (let ((asset (unwrap! (map-get? assets { asset-id: asset-id }) err-asset-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set assets
      { asset-id: asset-id }
      (merge asset { status: new-status })
    )
    (ok true)
  )
)
