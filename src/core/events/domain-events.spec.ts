import { AggregateRoot } from '@/core/entities/aggregate-root'
import { DomainEvent } from './domain-event'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { DomainEvents } from './domain-events'

class CustomAggregateCreated implements DomainEvent {
  ocurredAt: Date
  private aggregate: CustomAggregate  // eslint-disable-line 
  constructor(aggregate: CustomAggregate) {
    this.aggregate = aggregate
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityId {
    return this.aggregate.id
  }
}

class CustomAggregate extends AggregateRoot<any> { // eslint-disable-line
  static create() {
    const aggregate = new CustomAggregate(null)
    aggregate.addDomainEvent(new CustomAggregateCreated(aggregate))
    return aggregate
  }
}

describe('Domain Events', () => {
  it('should be able to dispatch and listen to events', () => {
    const callbackSpy = vi.fn()
    // subscriber cadatrado(ouvindo o envento de reposta criada)
    DomainEvents.register(callbackSpy, CustomAggregateCreated.name)

    // estou criando uma reposta sem criar no banco
    const aggregate = CustomAggregate.create()

    expect(aggregate.domainEvents).toHaveLength(1)

    // estou disparando o evento criado apos criar no banco
    DomainEvents.dispatchEventsForAggregate(aggregate.id)

    expect(callbackSpy).toHaveBeenCalledTimes(1)
    expect(aggregate.domainEvents).toHaveLength(0)
  })
})
